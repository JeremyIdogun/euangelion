import { useEffect, useState } from 'react';
import { getPillars } from '../../lib/queries';

export default function TagSelector({ selected = [], onChange }) {
  const [pillars, setPillars] = useState([]);

  useEffect(() => {
    getPillars().then(setPillars).catch(console.error);
  }, []);

  function toggle(id) {
    if (selected.includes(id)) {
      onChange(selected.filter((x) => x !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {pillars.map((p) => {
        const active = selected.includes(p.id);
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => toggle(p.id)}
            className="text-xs px-3 py-1.5 rounded-full font-ui font-medium transition-all border-2"
            style={{
              backgroundColor: active ? p.color : 'transparent',
              borderColor: p.color,
              color: active ? '#fff' : p.color,
            }}
          >
            {p.icon} {p.name}
          </button>
        );
      })}
    </div>
  );
}
