import { useEffect, useState, useCallback } from 'react';
import { getPendingReviewSermons } from '../../lib/queries';
import ReviewQueueTable from '../../components/admin/ReviewQueueTable';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function ReviewQueue() {
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getPendingReviewSermons()
      .then(setSermons)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <Link
          to="/admin"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary font-ui mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          Dashboard
        </Link>

        <div className="flex items-center justify-between mb-2">
          <h1
            className="text-3xl font-bold"
            style={{ color: '#8B4513', fontFamily: 'Georgia, serif' }}
          >
            Review Queue
          </h1>
          {!loading && (
            <span className="text-sm text-muted font-ui">
              {sermons.length} pending
            </span>
          )}
        </div>
        <p className="text-sm text-muted font-ui mb-8">
          Review imported sermons, approve or correct pillar tags.
        </p>

        <div className="bg-card-bg rounded-2xl p-6 shadow-soft border border-amber-50">
          <ReviewQueueTable sermons={sermons} loading={loading} />
        </div>
      </div>
    </div>
  );
}
