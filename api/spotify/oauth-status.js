import { requireAdminSession } from '../../lib/server/admin-auth.js';
import { createSupabaseAdminClient, getStoredSpotifyOAuthToken } from '../../lib/server/spotify.js';

let supabaseClient = null;

function getSupabase() {
  if (!supabaseClient) {
    supabaseClient = createSupabaseAdminClient();
  }
  return supabaseClient;
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    if (!requireAdminSession(req, res)) return;

    const supabase = getSupabase();
    const token = await getStoredSpotifyOAuthToken(supabase);
    return res.status(200).json({
      connected: Boolean(token?.refresh_token),
      expiresAt: token?.expires_at || null,
      scope: token?.scope || null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected server error';
    return res.status(500).json({ error: message });
  }
}
