import { Outlet, NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import ErrorBoundary from './ErrorBoundary';
import { IconInbox, IconDocs, IconComponentes, IconSearch, IconUser, IconKey, IconLogout, IconUsers, IconChangelog } from './Icons';
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
  const location = useLocation();
  const [components, setComponents] = useState([]);
  const [q, setQ] = useState('');
  const [componentsOpen, setComponentsOpen] = useState(true);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const modalInputRef = useRef(null);
  const avatarMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target)) setAvatarMenuOpen(false);
    };
    if (avatarMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [avatarMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    api.get('/components')
      .then((res) => setComponents(res.data || []))
      .catch(() => setComponents([]));
  }, []);

  useEffect(() => {
    if (searchModalOpen) {
      modalInputRef.current?.focus();
    }
  }, [searchModalOpen]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchModalOpen(false);
        setAvatarMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const filtered = (components || []).filter((c) => {
    const name = (c.title || c.name || '').toLowerCase();
    return name.includes(q.toLowerCase());
  });
  const firstComponent = filtered.length > 0 ? filtered[0] : null;

  const navLinkClass = ({ isActive }) => `layout-nav-link ${isActive ? 'active' : ''}`;
  const componentesNavClass = ({ isActive }) => {
    const onComponentPage = location.pathname.startsWith('/components/') && location.pathname !== '/components' && location.pathname !== '/components/new';
    return `layout-nav-link ${isActive || onComponentPage ? 'active' : ''}`;
  };
  const sideLinkClass = ({ isActive }) => (isActive ? 'active' : '');
  const profileLabel = { admin: 'Administrador', designer: 'Designer', developer: 'Desenvolvedor' };

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-header-inner">
          <Link to="/docs" className="layout-brand">
            <img src="/logo.svg" alt="Belier" className="layout-logo" />
          </Link>
          <nav className="layout-nav">
            <NavLink to="/docs" className={navLinkClass}>
              <IconDocs /> Docs
            </NavLink>
            <NavLink to="/notifications" className={navLinkClass} end>
              <IconInbox /> Inbox
            </NavLink>
            <a href={FIGMA_URL} target="_blank" rel="noopener noreferrer" className="layout-nav-link">
              <img src="/figma.svg" alt="" className="layout-nav-figma-icon" aria-hidden /> Figma
            </a>
            <NavLink to="/changelog" className={navLinkClass}>
              <IconChangelog /> ChangeLog
            </NavLink>
            {firstComponent ? (
              <NavLink to={`/components/${firstComponent.id}`} className={componentesNavClass}>
                <IconComponentes /> Componentes
              </NavLink>
            ) : (
              <NavLink to="/" className={navLinkClass} end>
                <IconComponentes /> Componentes
              </NavLink>
            )}
          </nav>
          <div className="layout-header-right">
            <button
              type="button"
              className="layout-search-trigger"
              onClick={() => setSearchModalOpen(true)}
              aria-label="Buscar (Ctrl+K)"
            >
              <span className="layout-search-icon" aria-hidden><IconSearch /></span>
              <span className="layout-search-trigger-text">Buscar</span>
              <kbd className="layout-search-kbd">Ctrl+K</kbd>
            </button>
            <Link to="/components/new" className="btn btn-primary layout-new-btn">Novo componente</Link>
            <div className="layout-user" ref={avatarMenuRef}>
              {user ? (
                <>
                  <button
                    type="button"
                    className="layout-avatar layout-avatar-btn"
                    onClick={(e) => { e.stopPropagation(); setAvatarMenuOpen((o) => !o); }}
                    aria-expanded={avatarMenuOpen}
                    aria-haspopup="true"
                    aria-label="Menu do usuário"
                    title={user.name}
                  >
                    {getInitials(user)}
                  </button>
                  {avatarMenuOpen && (
                    <div className="avatar-modal" role="menu">
                      <div className="avatar-modal-user">
                        <div className="avatar-modal-avatar">{getInitials(user)}</div>
                        <div className="avatar-modal-info">
                          <span className="avatar-modal-name">{user.name}</span>
                          <span className="avatar-modal-role">{profileLabel[user.profile] || user.profile}</span>
                        </div>
                      </div>
                      <div className="avatar-modal-sep" />
                      <div className="avatar-modal-menu">
                        <Link
                          to="/users"
                          className={`avatar-modal-item ${location.pathname === '/users' ? 'selected' : ''}`}
                          onClick={() => setAvatarMenuOpen(false)}
                          role="menuitem"
                        >
                          <IconUsers /> Usuários
                        </Link>
                        <Link
                          to="/profile"
                          className={`avatar-modal-item ${location.pathname === '/profile' ? 'selected' : ''}`}
                          onClick={() => setAvatarMenuOpen(false)}
                          role="menuitem"
                        >
                          <IconUser /> Perfil
                        </Link>
                        <Link
                          to="/profile/trocar-senha"
                          className={`avatar-modal-item ${location.pathname === '/profile/trocar-senha' ? 'selected' : ''}`}
                          onClick={() => setAvatarMenuOpen(false)}
                          role="menuitem"
                        >
                          <IconKey /> Trocar senha
                        </Link>
                      </div>
                      <div className="avatar-modal-sep" />
                      <button type="button" className="avatar-modal-item avatar-modal-sair" onClick={() => { handleLogout(); setAvatarMenuOpen(false); }} role="menuitem">
                        <IconLogout /> Sair
                      </button>
                    </div>
                  )}
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
              <li><NavLink to="/docs" className={sideLinkClass}><IconDocs /> Docs</NavLink></li>
              <li><NavLink to="/notifications" className={sideLinkClass} end><IconInbox /> Inbox</NavLink></li>
              <li><a href={FIGMA_URL} target="_blank" rel="noopener noreferrer"><img src="/figma.svg" alt="" className="layout-side-figma-icon" aria-hidden /> Figma</a></li>
              <li><NavLink to="/changelog" className={sideLinkClass}><IconChangelog /> ChangeLog</NavLink></li>
              <li>
                <button
                  type="button"
                  className="layout-side-toggle"
                  onClick={() => setComponentsOpen((o) => !o)}
                  aria-expanded={componentsOpen}
                  aria-label={componentsOpen ? 'Fechar lista de componentes' : 'Abrir lista de componentes'}
                >
                  <IconComponentes />
                  <span className="layout-side-toggle-text">Componentes</span>
                  <span className="layout-side-arrow" aria-hidden>{componentsOpen ? '▼' : '▶'}</span>
                </button>
              </li>
            </ul>
            {componentsOpen && (
              <ul className="layout-side-list layout-side-components">
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
            )}
          </nav>
        </aside>
        <section className="layout-content">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </section>
      </main>

      {searchModalOpen && (
        <div
          className="search-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Buscar"
          onClick={() => setSearchModalOpen(false)}
        >
          <div className="search-modal" onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-input-wrap">
              <span className="search-modal-icon" aria-hidden><IconSearch /></span>
              <input
                ref={modalInputRef}
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="search-modal-input"
                placeholder="Buscar documentação..."
                aria-label="Buscar"
                autoComplete="off"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setSearchModalOpen(false);
                  if (e.key === 'Enter' && filtered.length > 0) {
                    navigate(`/components/${filtered[0].id}`);
                    setSearchModalOpen(false);
                  }
                }}
              />
              {q.length > 0 && (
                <button
                  type="button"
                  className="search-modal-clear"
                  onClick={() => setQ('')}
                  aria-label="Limpar"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              )}
              <span className="search-modal-esc">ESC</span>
            </div>
            <div className="search-modal-results">
              {!q.trim() ? (
                <p className="search-modal-empty">Nenhuma busca recente</p>
              ) : filtered.length === 0 ? (
                <p className="search-modal-empty">Nenhum resultado para &quot;{q}&quot;</p>
              ) : (
                <ul className="search-modal-list" role="listbox">
                  {filtered.map((c, i) => (
                    <li key={c.id} role="option" aria-selected={i === 0}>
                      <button
                        type="button"
                        className={`search-modal-item ${i === 0 ? 'active' : ''}`}
                        onClick={() => {
                          navigate(`/components/${c.id}`);
                          setSearchModalOpen(false);
                        }}
                      >
                        <span className="search-modal-item-icon"><IconComponentes /></span>
                        <span className="search-modal-item-text">{c.title || c.name}</span>
                        <span className="search-modal-item-arrow" aria-hidden>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
