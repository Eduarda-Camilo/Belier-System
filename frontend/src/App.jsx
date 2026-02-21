import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import ComponentList from './pages/ComponentList';
import ComponentDetail from './pages/ComponentDetail';
import ComponentForm from './pages/ComponentForm';
import CategoryList from './pages/CategoryList';
import Notifications from './pages/Notifications';
import UserList from './pages/UserList';

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
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/components" replace />} />
        <Route path="components" element={<ComponentList />} />
        <Route path="components/new" element={<ProtectedRoute allowedProfiles={['admin', 'designer']}><ComponentForm /></ProtectedRoute>} />
        <Route path="components/:id" element={<ComponentDetail />} />
        <Route path="components/:id/edit" element={<ProtectedRoute allowedProfiles={['admin', 'designer']}><ComponentForm /></ProtectedRoute>} />
        <Route path="categories" element={<CategoryList />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="users" element={<ProtectedRoute allowedProfiles={['admin']}><UserList /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
