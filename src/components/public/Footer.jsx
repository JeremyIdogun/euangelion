import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-amber-100 bg-card-bg mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <Link to="/" className="inline-block mb-2">
              <img
                src="/branding/besorah_primary_logo.svg"
                alt="Besorah"
                className="h-7 w-auto"
              />
            </Link>
            <p className="text-xs text-muted font-ui">
              Good News, Organised by Theme.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-ui">
            <Link to="/" className="text-muted hover:text-primary transition-colors">Home</Link>
            <Link to="/search" className="text-muted hover:text-primary transition-colors">Search</Link>
            <Link to="/about" className="text-muted hover:text-primary transition-colors">About</Link>
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-amber-100">
          <p className="text-xs text-muted/70 font-ui">
            &copy; {new Date().getFullYear()} Besorah. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
