import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Layout.css';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [components, setComponents] = useState([]);
  const [q, setQ] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    api.get('/components')
      .then((res) => setComponents(res.data || []))
      .catch(() => setComponents([]));
  }, []);

  const filtered = (components || []).filter((c) => {
    const name = (c.title || c.name || '').toLowerCase();
    return name.includes(q.toLowerCase());
  });

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-header-inner">
          <Link to="/" className="layout-brand">Belier-System</Link>
          <div className="layout-search">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="layout-search-input"
              placeholder="Buscar componentes..."
              aria-label="Buscar componentes"
            />
            <Link to="/components/new" className="btn btn-primary layout-new-btn">Novo componente</Link>
          </div>
          <div className="layout-user">
            {user ? (
              <>
                <span className="layout-user-name">{user.name}</span>
                <span className="layout-user-profile">({user.profile})</span>
                <button type="button" onClick={handleLogout} className="btn btn-ghost">Sair</button>
              </>
            ) : (
              <NavLink to="/login" className="btn btn-primary">Entrar</NavLink>
            )}
          </div>
        </div>
      </header>
      <main className="layout-main layout-with-sidebar">
        <aside className="layout-sidebar">
          <nav>
            <p className="layout-side-title">Navegação</p>
            <ul className="layout-side-list">
              <li><NavLink to="/categories">Categorias</NavLink></li>
              {user && <li><NavLink to="/notifications">Notificações</NavLink></li>}
              {user?.profile === 'admin' && <li><NavLink to="/users">Usuários</NavLink></li>}
            </ul>
            <p className="layout-side-title">Componentes</p>
            <ul className="layout-side-list">
              {filtered.length === 0 ? (
                <li className="layout-side-empty">Nenhum componente</li>
              ) : (
                filtered.map((c) => (
                  <li key={c.id}>
                    <NavLink to={`/components/${c.id}`}>{c.title || c.name}</NavLink>
                  </li>
                ))
              )}
            </ul>
          </nav>
        </aside>
        <section className="layout-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
