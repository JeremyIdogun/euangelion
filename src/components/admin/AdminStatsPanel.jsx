import { useEffect, useState } from 'react';
import { getAdminStats } from '../../lib/queries';
import { Loader } from 'lucide-react';

function StatCard({ label, value, color }) {
  return (
    <div className="bg-card-bg rounded-xl p-5 shadow-soft border border-amber-50">
      <p className="text-xs text-muted font-ui uppercase tracking-wide mb-1">{label}</p>
      <p className="text-3xl font-bold" style={{ color, fontFamily: 'Georgia, serif' }}>{value}</p>
    </div>
  );
}

export default function AdminStatsPanel() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader size={20} className="animate-spin text-muted" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard label="Total Sermons" value={stats.total} color="#8B4513" />
      <StatCard label="Pending Review" value={stats.unreviewed} color="#C17B3F" />
      <StatCard label="Approved" value={stats.approved} color="#6BAA75" />
      <StatCard label="Active Shows" value={stats.activeShows} color="#4A90A4" />
    </div>
  );
}
