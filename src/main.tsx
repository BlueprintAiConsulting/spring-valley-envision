import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';

// Lazy-load the visualizer and landing
const App = lazy(() => import('./App'));
const Landing = lazy(() => import('./Landing'));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <HashRouter>
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/app" element={<App />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/overview" element={<Landing />} />
              <Route path="/login" element={<Navigate to="/app" replace />} />
              <Route path="*" element={<Navigate to="/app" replace />} />
            </Routes>
          </Suspense>
        </HashRouter>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);
