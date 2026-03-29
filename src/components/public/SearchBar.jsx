import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

export default function SearchBar({ initialValue = '', onSearch, placeholder = 'Search sermons, preachers, churches…' }) {
  const [value, setValue] = useState(initialValue);
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    if (!value.trim()) return;
    if (onSearch) {
      onSearch(value.trim());
    } else {
      navigate(`/search?q=${encodeURIComponent(value.trim())}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xl mx-auto">
      <Search
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-11 pr-28 py-3 rounded-full border border-amber-200 bg-white text-text-main placeholder-muted text-sm font-ui shadow-soft focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white text-sm font-ui font-medium px-4 py-1.5 rounded-full hover:bg-accent transition-colors"
      >
        Search
      </button>
    </form>
  );
}
