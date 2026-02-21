import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { IconInbox, IconDocs, IconFigma, IconComponentes, IconSearch } from './Icons';
import './Layout.css';

const FIGMA_URL = 'https://www.figma.com';

function getInitials(user) {
  if (!user?.name) return 'U';
  const parts = user.name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2);
  return (user.name[0] || 'U').toUpperCase();
}

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

  const navLinkClass = ({ isActive }) => `layout-nav-link ${isActive ? 'active' : ''}`;
  const sideLinkClass = ({ isActive }) => (isActive ? 'active' : '');

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-header-inner">
          <Link to="/" className="layout-brand">
            <img src="/logo.svg" alt="Belier" className="layout-logo" />
          </Link>
          <nav className="layout-nav">
            <NavLink to="/notifications" className={navLinkClass} end>
              <IconInbox /> Inbox
            </NavLink>
            <NavLink to="/categories" className={navLinkClass}>
              <IconDocs /> Docs
            </NavLink>
            <a href={FIGMA_URL} target="_blank" rel="noopener noreferrer" className="layout-nav-link">
              <IconFigma /> Figma
            </a>
            <NavLink to="/" className={navLinkClass} end>
              <IconComponentes /> Componentes
            </NavLink>
          </nav>
          <div className="layout-header-right">
            <div className="layout-search-wrap">
              <span className="layout-search-icon" aria-hidden><IconSearch /></span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="layout-search-input"
                placeholder="Buscar..."
                aria-label="Buscar"
              />
            </div>
            <Link to="/components/new" className="btn btn-primary layout-new-btn">Novo componente</Link>
            <div className="layout-user">
              {user ? (
                <>
                  <div className="layout-avatar" title={user.name}>{getInitials(user)}</div>
                  <button type="button" onClick={handleLogout} className="btn btn-ghost layout-logout">Sair</button>
                </>
              ) : (
                <NavLink to="/login" className="btn btn-primary">Entrar</NavLink>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="layout-main layout-with-sidebar">
        <aside className="layout-sidebar">
          <nav>
            <ul className="layout-side-list">
              <li><NavLink to="/notifications" className={sideLinkClass} end><IconInbox /> Inbox</NavLink></li>
              <li><NavLink to="/categories" className={sideLinkClass}><IconDocs /> Docs</NavLink></li>
              <li><a href={FIGMA_URL} target="_blank" rel="noopener noreferrer"><IconFigma /> Figma</a></li>
              <li><NavLink to="/" className={sideLinkClass} end><IconComponentes /> Componentes</NavLink></li>
            </ul>
            <p className="layout-side-title">Componentes</p>
            <ul className="layout-side-list">
              {filtered.length === 0 ? (
                <li className="layout-side-empty">Nenhum componente</li>
              ) : (
                filtered.map((c) => (
                  <li key={c.id}>
                    <NavLink to={`/components/${c.id}`} className={sideLinkClass}>{c.title || c.name}</NavLink>
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
