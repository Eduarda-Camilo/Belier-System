import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Register from './pages/Register';
import ComponentDetail from './pages/ComponentDetail';
import ComponentForm from './pages/ComponentForm';
import Docs from './pages/Docs';
import FirstComponentRedirect from './pages/FirstComponentRedirect';
import Notifications from './pages/Notifications';
import UserList from './pages/UserList';
import ChangeLog from './pages/ChangeLog';

function ProtectedRoute({ children, allowedProfiles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-loading">Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedProfiles && !allowedProfiles.includes(user.profile)) {
    return <div className="app-error">Sem permissão para esta página.</div>;
  }
  return children;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Layout />}>
        <Route index element={<FirstComponentRedirect />} />
        <Route path="components" element={<Outlet />}>
          <Route index element={<FirstComponentRedirect />} />
          <Route path="new" element={<ProtectedRoute allowedProfiles={['admin', 'designer']}><ComponentForm /></ProtectedRoute>} />
          <Route path=":id" element={<ErrorBoundary><ComponentDetail /></ErrorBoundary>} />
          <Route path=":id/edit" element={<ProtectedRoute allowedProfiles={['admin', 'designer']}><ComponentForm /></ProtectedRoute>} />
        </Route>
        <Route path="docs" element={<Docs />} />
        <Route path="notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="changelog" element={<ProtectedRoute><ChangeLog /></ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute><div className="page"><h1 className="page-title">Perfil</h1><p>Em breve.</p></div></ProtectedRoute>} />
        <Route path="profile/trocar-senha" element={<ProtectedRoute><div className="page"><h1 className="page-title">Trocar senha</h1><p>Em breve.</p></div></ProtectedRoute>} />
        <Route path="users" element={<ProtectedRoute allowedProfiles={['admin']}><UserList /></ProtectedRoute>} />
      </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}
