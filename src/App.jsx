import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/public/Navbar';
import Home from './pages/public/Home';
import Pillar from './pages/public/Pillar';
import Search from './pages/public/Search';
import SermonDetail from './pages/public/SermonDetail';
import Dashboard from './pages/admin/Dashboard';
import Shows from './pages/admin/Shows';
import ReviewQueue from './pages/admin/ReviewQueue';
import SermonEdit from './pages/admin/SermonEdit';

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          }
        />
        <Route
          path="/pillar/:slug"
          element={
            <PublicLayout>
              <Pillar />
            </PublicLayout>
          }
        />
        <Route
          path="/search"
          element={
            <PublicLayout>
              <Search />
            </PublicLayout>
          }
        />
        <Route
          path="/sermon/:id"
          element={
            <PublicLayout>
              <SermonDetail />
            </PublicLayout>
          }
        />

        {/* Admin routes */}
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/shows" element={<Shows />} />
        <Route path="/admin/review" element={<ReviewQueue />} />
        <Route path="/admin/sermons/:id" element={<SermonEdit />} />
      </Routes>
    </BrowserRouter>
  );
}
