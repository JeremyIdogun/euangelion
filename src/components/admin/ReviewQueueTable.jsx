import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ReviewQueueTable({ sermons, loading }) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-amber-50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!sermons?.length) {
    return (
      <div className="text-center py-10 text-muted font-ui">
        <p className="text-3xl mb-2">✅</p>
        <p>No sermons pending review.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm font-ui">
        <thead>
          <tr className="border-b border-amber-100 text-left">
            <th className="py-2 pr-4 text-muted font-medium">Title</th>
            <th className="py-2 pr-4 text-muted font-medium hidden sm:table-cell">Preacher</th>
            <th className="py-2 pr-4 text-muted font-medium hidden md:table-cell">Imported</th>
            <th className="py-2 pr-4 text-muted font-medium">Suggested Tags</th>
            <th className="py-2 text-muted font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sermons.map((sermon) => {
            const pillars = sermon.sermon_pillars?.map((sp) => sp.pillars).filter(Boolean) ?? [];
            return (
              <tr key={sermon.id} className="border-b border-amber-50 hover:bg-amber-50/50 transition-colors">
                <td className="py-3 pr-4">
                  <span className="font-medium text-text-main line-clamp-1">{sermon.title}</span>
                </td>
                <td className="py-3 pr-4 hidden sm:table-cell text-muted">{sermon.preacher || '—'}</td>
                <td className="py-3 pr-4 hidden md:table-cell text-muted">{formatDate(sermon.created_at)}</td>
                <td className="py-3 pr-4">
                  <div className="flex flex-wrap gap-1">
                    {pillars.length ? pillars.map((p) => (
                      <span
                        key={p.id}
                        className="text-xs px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: p.color }}
                      >
                        {p.name}
                      </span>
                    )) : <span className="text-muted text-xs">None</span>}
                  </div>
                </td>
                <td className="py-3">
                  <Link
                    to={`/admin/sermons/${sermon.id}`}
                    className="inline-flex items-center gap-1 text-xs text-accent hover:text-primary font-medium transition-colors"
                  >
                    <Eye size={12} />
                    Review
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
