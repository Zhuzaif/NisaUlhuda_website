import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ScrollToTop from './components/ScrollToTop';
import PageLoader from './components/PageLoader';
import { prefetchRoute } from './utils/prefetch';

// Lazy load secondary routes so initial page load is lightning fast
const Download = lazy(() => import('./pages/Download'));
const DailyAyat = lazy(() => import('./pages/DailyAyat'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/Terms'));
const Contact = lazy(() => import('./pages/Contact'));
const Sitemap = lazy(() => import('./pages/Sitemap'));
const AdminPortal = lazy(() => import('./pages/AdminPortal'));

function App() {
  // Idle prefetching: Silently preload high-traffic pages (DailyAyat, Download) in background
  // so the user experiences zero waiting time when clicking links
  useEffect(() => {
    prefetchRoute('daily-ayat', () => import('./pages/DailyAyat'));
    prefetchRoute('download', () => import('./pages/Download'));
  }, []);

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="download" element={<Download />} />
            <Route path="daily-ayat" element={<DailyAyat />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="terms" element={<Terms />} />
            <Route path="contact" element={<Contact />} />
            <Route path="sitemap" element={<Sitemap />} />
          </Route>
          {/* Hidden Admin Portal (No public navbar/footer) */}
          <Route path="admin-portal" element={<AdminPortal />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
