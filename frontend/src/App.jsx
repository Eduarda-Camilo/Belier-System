import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
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
      <Route path="/" element={<Layout />}>
        <Route index element={<div className="page-empty">Selecione um componente no menu lateral.</div>} />
        <Route path="components" element={<Outlet />}>
          <Route index element={<div className="page-empty">Selecione um componente no menu lateral.</div>} />
          <Route path="new" element={<ProtectedRoute allowedProfiles={['admin', 'designer']}><ComponentForm /></ProtectedRoute>} />
          <Route path=":id" element={<ComponentDetail />} />
          <Route path=":id/edit" element={<ProtectedRoute allowedProfiles={['admin', 'designer']}><ComponentForm /></ProtectedRoute>} />
        </Route>
        <Route path="categories" element={<CategoryList />} />
        <Route path="notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="users" element={<ProtectedRoute allowedProfiles={['admin']}><UserList /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
