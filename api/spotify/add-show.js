import { createClient } from '@supabase/supabase-js';
import { suggestPillars } from '../../src/lib/classifier.js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

async function getSpotifyToken() {
  const creds = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
  ).toString('base64');

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`Spotify token error: ${data.error}`);
  return data.access_token;
}

async function fetchShow(token, showId) {
  const res = await fetch(`https://api.spotify.com/v1/shows/${showId}?market=GB`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Spotify show error: ${data.error?.message}`);
  return data;
}

async function fetchAllEpisodes(token, showId) {
  const episodes = [];
  let url = `https://api.spotify.com/v1/shows/${showId}/episodes?market=GB&limit=50`;

  while (url) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`Spotify episodes error: ${data.error?.message}`);
    episodes.push(...data.items);
    url = data.next;
  }

  return episodes;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { showId } = req.body;
  if (!showId) return res.status(400).json({ error: 'showId is required' });

  // Log ingestion run start
  const { data: run } = await supabase
    .from('ingestion_runs')
    .insert({ spotify_show_id: showId, status: 'running' })
    .select()
    .single();

  try {
    const token = await getSpotifyToken();
    const show = await fetchShow(token, showId);

    // Upsert show
    await supabase.from('spotify_shows').upsert(
      {
        spotify_show_id: show.id,
        title: show.name,
        publisher: show.publisher,
        description: show.description,
        image_url: show.images?.[0]?.url ?? null,
        external_url: show.external_urls?.spotify ?? null,
        status: 'active',
        last_synced_at: new Date().toISOString(),
      },
      { onConflict: 'spotify_show_id' },
    );

    const episodes = await fetchAllEpisodes(token, showId);
    let episodesImported = 0;

    // Fetch all pillars for slug→id mapping
    const { data: pillars } = await supabase.from('pillars').select('id, slug');
    const pillarBySlug = Object.fromEntries(pillars.map((p) => [p.slug, p.id]));

    for (const ep of episodes) {
      const releaseDate = ep.release_date
        ? new Date(ep.release_date).toISOString().split('T')[0]
        : null;

      const sermonPayload = {
        spotify_episode_id: ep.id,
        spotify_show_id: show.id,
        title: ep.name,
        description: ep.description,
        church: show.publisher ?? null,
        date_preached: releaseDate,
        platform: 'spotify',
        external_url: ep.external_urls?.spotify ?? '',
        embed_url: `https://open.spotify.com/embed/episode/${ep.id}`,
        image_url: ep.images?.[0]?.url ?? show.images?.[0]?.url ?? null,
        classification_status: 'pending',
        review_status: 'unreviewed',
      };

      const { data: sermon, error: sermonError } = await supabase
        .from('sermons')
        .upsert(sermonPayload, { onConflict: 'spotify_episode_id' })
        .select()
        .single();

      if (sermonError) continue;
      episodesImported++;

      // Run classifier
      const suggestions = suggestPillars({
        title: ep.name,
        description: ep.description || '',
        showTitle: show.name,
        publisher: show.publisher || '',
      });

      if (suggestions.length) {
        const tagRows = suggestions
          .map((s) => ({
            sermon_id: sermon.id,
            pillar_id: pillarBySlug[s.pillar_slug],
            source: s.source,
            confidence_score: s.confidence_score,
          }))
          .filter((r) => r.pillar_id);

        if (tagRows.length) {
          await supabase
            .from('sermon_pillars')
            .upsert(tagRows, { onConflict: 'sermon_id,pillar_id', ignoreDuplicates: true });
        }
      }
    }

    // Complete ingestion run
    await supabase
      .from('ingestion_runs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        summary_json: { new: episodesImported, updated: 0 },
      })
      .eq('id', run.id);

    return res.status(200).json({
      show: { title: show.name },
      episodesImported,
    });
  } catch (err) {
    await supabase
      .from('ingestion_runs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_json: { message: err.message },
      })
      .eq('id', run?.id);

    return res.status(500).json({ error: err.message });
  }
}
