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

export default async function handler(req, res) {
  // Validate cron secret to prevent unauthorised triggers
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data: shows, error } = await supabase
    .from('spotify_shows')
    .select('spotify_show_id')
    .eq('status', 'active');

  if (error) return res.status(500).json({ error: error.message });

  const token = await getSpotifyToken();
  const { data: pillars } = await supabase.from('pillars').select('id, slug');
  const pillarBySlug = Object.fromEntries(pillars.map((p) => [p.slug, p.id]));

  const results = [];

  for (const show of shows) {
    const runInsert = await supabase
      .from('ingestion_runs')
      .insert({ spotify_show_id: show.spotify_show_id, status: 'running' })
      .select()
      .single();
    const run = runInsert.data;

    try {
      const showRes = await fetch(
        `https://api.spotify.com/v1/shows/${show.spotify_show_id}?market=GB`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const showData = await showRes.json();

      const episodes = [];
      let url = `https://api.spotify.com/v1/shows/${show.spotify_show_id}/episodes?market=GB&limit=50`;
      while (url) {
        const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        const d = await r.json();
        if (!r.ok) break;
        episodes.push(...d.items);
        url = d.next;
      }

      let newEpisodes = 0;
      let updatedEpisodes = 0;

      for (const ep of episodes) {
        const { data: existing } = await supabase
          .from('sermons')
          .select('id')
          .eq('spotify_episode_id', ep.id)
          .single();

        const releaseDate = ep.release_date
          ? new Date(ep.release_date).toISOString().split('T')[0]
          : null;

        const payload = {
          spotify_episode_id: ep.id,
          spotify_show_id: showData.id,
          title: ep.name,
          description: ep.description,
          church: showData.publisher ?? null,
          date_preached: releaseDate,
          platform: 'spotify',
          external_url: ep.external_urls?.spotify ?? '',
          embed_url: `https://open.spotify.com/embed/episode/${ep.id}`,
          image_url: ep.images?.[0]?.url ?? showData.images?.[0]?.url ?? null,
          updated_at: new Date().toISOString(),
        };

        if (!existing) {
          payload.classification_status = 'pending';
          payload.review_status = 'unreviewed';
        }

        const { data: sermon, error: uErr } = await supabase
          .from('sermons')
          .upsert(payload, { onConflict: 'spotify_episode_id' })
          .select()
          .single();

        if (uErr) continue;

        if (!existing) {
          newEpisodes++;
          const suggestions = suggestPillars({
            title: ep.name,
            description: ep.description || '',
            showTitle: showData.name,
            publisher: showData.publisher || '',
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
        } else {
          updatedEpisodes++;
        }
      }

      await supabase
        .from('spotify_shows')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('spotify_show_id', show.spotify_show_id);

      await supabase
        .from('ingestion_runs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          summary_json: { new: newEpisodes, updated: updatedEpisodes },
        })
        .eq('id', run?.id);

      results.push({ showId: show.spotify_show_id, newEpisodes, updatedEpisodes });
    } catch (err) {
      await supabase
        .from('ingestion_runs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_json: { message: err.message },
        })
        .eq('id', run?.id);

      results.push({ showId: show.spotify_show_id, error: err.message });
    }
  }

  return res.status(200).json({ results });
}
