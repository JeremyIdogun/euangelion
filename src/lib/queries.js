import { supabase } from './supabase';

// ── Public queries ────────────────────────────────────────────────────────────

export async function getPillars() {
  const { data, error } = await supabase
    .from('pillars')
    .select('*, sermon_pillars(sermon_id)')
    .order('name');
  if (error) throw error;
  return data.map((p) => ({ ...p, sermon_count: p.sermon_pillars?.length ?? 0 }));
}

export async function getPillarBySlug(slug) {
  const { data, error } = await supabase
    .from('pillars')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) throw error;
  return data;
}

export async function getSermonsByPillar(pillarId) {
  const { data, error } = await supabase
    .from('sermon_pillars')
    .select('sermons(*)')
    .eq('pillar_id', pillarId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map((row) => row.sermons).filter(Boolean);
}

export async function searchSermons(query) {
  const q = `%${query}%`;
  const { data, error } = await supabase
    .from('sermons')
    .select('*')
    .or(`title.ilike.${q},preacher.ilike.${q},church.ilike.${q},description.ilike.${q}`)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data;
}

export async function getSermonById(id) {
  const { data, error } = await supabase
    .from('sermons')
    .select('*, sermon_pillars(pillar_id, source, confidence_score, pillars(*))')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function getLatestSermons(limit = 6) {
  const { data, error } = await supabase
    .from('sermons')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

// ── Admin queries ─────────────────────────────────────────────────────────────

export async function getSpotifyShows() {
  const { data, error } = await supabase
    .from('spotify_shows')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getIngestionRuns(limit = 10) {
  const { data, error } = await supabase
    .from('ingestion_runs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function getPendingReviewSermons() {
  const { data, error } = await supabase
    .from('sermons')
    .select('*, sermon_pillars(pillar_id, source, confidence_score, pillars(*))')
    .eq('review_status', 'unreviewed')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getAdminSermonById(id) {
  return getSermonById(id);
}

export async function getAdminStats() {
  const [unreviewed, approved, total, shows] = await Promise.all([
    supabase.from('sermons').select('id', { count: 'exact', head: true }).eq('review_status', 'unreviewed'),
    supabase.from('sermons').select('id', { count: 'exact', head: true }).eq('review_status', 'approved'),
    supabase.from('sermons').select('id', { count: 'exact', head: true }),
    supabase.from('spotify_shows').select('id', { count: 'exact', head: true }).eq('status', 'active'),
  ]);
  return {
    unreviewed: unreviewed.count ?? 0,
    approved: approved.count ?? 0,
    total: total.count ?? 0,
    activeShows: shows.count ?? 0,
  };
}

export async function updateSermonReview(sermonId, { reviewStatus, preacher, church, description }) {
  const { error } = await supabase
    .from('sermons')
    .update({
      review_status: reviewStatus,
      preacher,
      church,
      description,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sermonId);
  if (error) throw error;
}

export async function upsertSermonPillars(sermonId, pillarIds, source = 'manual') {
  // Remove existing manual tags
  await supabase
    .from('sermon_pillars')
    .delete()
    .eq('sermon_id', sermonId)
    .eq('source', 'manual');

  if (!pillarIds.length) return;

  const rows = pillarIds.map((pid) => ({
    sermon_id: sermonId,
    pillar_id: pid,
    source,
    confidence_score: 1.0,
  }));

  const { error } = await supabase.from('sermon_pillars').upsert(rows);
  if (error) throw error;
}

export async function logReviewAction(sermonId, action, notes = '') {
  const { error } = await supabase.from('admin_review_log').insert({
    sermon_id: sermonId,
    action,
    notes,
  });
  if (error) throw error;
}
