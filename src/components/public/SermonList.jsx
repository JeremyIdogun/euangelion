import SermonCard from './SermonCard';

export default function SermonList({ sermons, loading = false }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card-bg rounded-2xl h-48 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!sermons?.length) {
    return (
      <div className="text-center py-16 text-muted font-ui">
        <p className="text-4xl mb-3">📖</p>
        <p>No sermons found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {sermons.map((sermon) => {
        const pillars = sermon.sermon_pillars?.map((sp) => sp.pillars).filter(Boolean) ?? [];
        return <SermonCard key={sermon.id} sermon={sermon} pillars={pillars} />;
      })}
    </div>
  );
}
