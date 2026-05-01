import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import AppLayout       from './components/Layout/AppLayout';
import Login           from './pages/Login';
import Dashboard       from './pages/Dashboard';
import Projects        from './pages/Projects';
import ProjectDetails  from './pages/ProjectDetails';
import Tasks           from './pages/Tasks';
import Users           from './pages/Users';
import LoadingSpinner  from './components/common/LoadingSpinner';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner size="lg" text="Authenticating…" />;
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <LoadingSpinner size="lg" />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner size="lg" />;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"  element={<PublicRoute><Login  /></PublicRoute>} />

      {/* Protected */}
      <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard"        element={<Dashboard />} />
        <Route path="/projects"         element={<Projects />} />
        <Route path="/projects/:id"     element={<ProjectDetails />} />
        <Route path="/tasks"            element={<Tasks />} />
        <Route path="/users"            element={<AdminRoute><Users /></AdminRoute>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#1e1e2e',
              color: '#cdd6f4',
              border: '1px solid #313244',
              borderRadius: '10px',
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
