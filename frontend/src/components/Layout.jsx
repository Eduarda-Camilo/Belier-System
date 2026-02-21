import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

const navStyle = {
  display: 'flex',
  gap: 'var(--spacing-md)',
  listStyle: 'none',
  margin: 0,
  padding: 0,
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-header-inner">
          <NavLink to="/components" className="layout-brand">Belier-System</NavLink>
          <nav>
            <ul style={navStyle}>
              <li><NavLink to="/components">Componentes</NavLink></li>
              <li><NavLink to="/categories">Categorias</NavLink></li>
              <li><NavLink to="/notifications">Notificações</NavLink></li>
              {user?.profile === 'admin' && (
                <li><NavLink to="/users">Usuários</NavLink></li>
              )}
            </ul>
          </nav>
          <div className="layout-user">
            <span className="layout-user-name">{user?.name}</span>
            <span className="layout-user-profile">({user?.profile})</span>
            <button type="button" onClick={handleLogout} className="btn btn-ghost">Sair</button>
          </div>
        </div>
      </header>
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}
