import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchSermons } from '../../lib/queries';
import SearchBar from '../../components/public/SearchBar';
import SermonList from '../../components/public/SermonList';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';

  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    setSearched(true);
    searchSermons(q)
      .then(setSermons)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [q]);

  function handleSearch(value) {
    setSearchParams({ q: value });
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="py-12 px-4 bg-card-bg border-b border-amber-100">
        <div className="max-w-2xl mx-auto text-center">
          <h1
            className="text-2xl font-bold mb-6"
            style={{ color: '#8B4513', fontFamily: 'Georgia, serif' }}
          >
            Search Sermons
          </h1>
          <SearchBar initialValue={q} onSearch={handleSearch} />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {q && (
          <p className="text-sm text-muted font-ui mb-6">
            {loading ? 'Searching…' : `${sermons.length} result${sermons.length !== 1 ? 's' : ''} for "${q}"`}
          </p>
        )}

        {!q && !searched && (
          <div className="text-center py-16 text-muted font-ui">
            <p className="text-4xl mb-3">🔍</p>
            <p>Enter a search term above to find sermons.</p>
          </div>
        )}

        {searched && <SermonList sermons={sermons} loading={loading} />}
      </div>
    </div>
  );
}
