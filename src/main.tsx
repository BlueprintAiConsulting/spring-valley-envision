import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Landing from './Landing';
import { ErrorBoundary } from './ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Login } from './components/auth/Login';
import './index.css';

// Lazy-load the visualizer so the landing page loads instantly
const App = lazy(() => import('./App'));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <Suspense fallback={null}>
                    <App />
                  </Suspense>
                </ProtectedRoute>
              }
            />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);
