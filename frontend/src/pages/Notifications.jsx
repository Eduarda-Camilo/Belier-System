import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Notifications.css';

const LIMIT = 50;
const TYPE_LABELS = {
  COMMENT_CREATED: 'Comentários',
  VERSION_PUBLISHED: 'Versões/Publicações',
  STATUS_CHANGED: 'Mudança de status',
  MENTION: 'Menções',
};

function NotificationIcon({ type }) {
  const cls = 'inbox-item-icon';
  switch (type) {
    case 'COMMENT_CREATED':
      return (
        <span className={cls} aria-hidden>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
        </span>
      );
    case 'VERSION_PUBLISHED':
      return (
        <span className={cls} aria-hidden>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
        </span>
      );
    case 'STATUS_CHANGED':
      return (
        <span className={cls} aria-hidden>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
        </span>
      );
    case 'MENTION':
      return (
        <span className={cls} aria-hidden>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
        </span>
      );
    default:
      return <span className={cls} aria-hidden>•</span>;
  }
}

function formatRelative(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `Há ${diffMins} min`;
  if (diffHours < 24) return `Há ${diffHours}h`;
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `Há ${diffDays} dias`;
  return d.toLocaleDateString('pt-BR');
}

function formatDateTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getSubtitle(n) {
  const author = n.actorName || 'Alguém';
  switch (n.type) {
    case 'COMMENT_CREATED':
      return `Novo comentário em ${n.variantTitle || 'Default'} por ${author}`;
    case 'VERSION_PUBLISHED':
      return `Nova versão publicada: ${n.versionLabel || 'v?'} por ${author}`;
    case 'STATUS_CHANGED':
      return `Status alterado por ${author}`;
    case 'MENTION':
      return `Você foi mencionado por ${author} em ${n.variantTitle || 'Default'}`;
    default:
      return `Atualização por ${author}`;
  }
}

function buildItemLink(n) {
  const base = `/components/${n.componentId}`;
  const params = new URLSearchParams();
  if (n.versionId) params.set('version', n.versionId);
  if (n.variantSlug || n.variantTitle) params.set('variant', n.variantSlug || String(n.variantTitle || '').toLowerCase().replace(/\s+/g, '-'));
  if (n.commentId) params.set('comment', n.commentId);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

function groupByDate(items) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);

  const groups = { today: [], yesterday: [], week: [], older: [] };
  items.forEach((item) => {
    const t = new Date(item.createdAt).getTime();
    if (t >= todayStart.getTime()) groups.today.push(item);
    else if (t >= yesterdayStart.getTime()) groups.yesterday.push(item);
    else if (t >= weekStart.getTime()) groups.week.push(item);
    else groups.older.push(item);
  });
  return groups;
}

export default function Notifications() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const tab = searchParams.get('tab') || 'all';
  const range = searchParams.get('range') || '';
  const type = searchParams.get('type') || 'all';
  const author = searchParams.get('author') || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  const [data, setData] = useState({ items: [], total_count: 0, unread_count: 0, page: 1, page_count: 1 });
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [undoIds, setUndoIds] = useState(null);

  const load = useCallback(() => {
    const params = { limit: LIMIT, page, tab: tab === 'nao-lidas' ? 'unread' : 'all' };
    if (range) params.range = range;
    if (type && type !== 'all') params.type = type;
    if (author) params.author = author;
    setLoading(true);
    api
      .get('/notifications', { params })
      .then((res) => {
        const d = res.data || {};
        setData({
          items: d.items || [],
          total_count: d.total_count ?? 0,
          unread_count: d.unread_count ?? 0,
          page: d.page ?? 1,
          page_count: d.page_count ?? 1,
        });
      })
      .catch((err) => setError(err.response?.data?.error || 'Erro ao carregar notificações.'))
      .finally(() => setLoading(false));
  }, [tab, range, type, author, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    api.get('/notifications/authors').then((res) => setAuthors(res.data || [])).catch(() => setAuthors([]));
  }, []);

  const setFilters = useCallback((updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v === '' || v === undefined) next.delete(k);
      else next.set(k, String(v));
    });
    if (!('page' in updates)) next.set('page', '1');
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  const unreadCount = data.unread_count;
  const filteredItems = useMemo(() => {
    if (tab === 'nao-lidas') return data.items.filter((n) => !n.readAt);
    return data.items;
  }, [tab, data.items]);

  const groups = useMemo(() => groupByDate(filteredItems), [filteredItems]);

  const markAsRead = useCallback(async (id, optimistic = true) => {
    if (optimistic) {
      setData((prev) => ({
        ...prev,
        items: prev.items.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)),
        unread_count: Math.max(0, prev.unread_count - (prev.items.find((n) => n.id === id && !n.readAt) ? 1 : 0)),
      }));
    }
    try {
      await api.patch(`/notifications/${id}/read`);
      window.dispatchEvent(new CustomEvent('inbox-updated'));
    } catch {
      if (optimistic) load();
    }
  }, [load]);

  const markUnreadAsRead = useCallback(async () => {
    const unreadIds = data.items.filter((n) => !n.readAt).map((n) => n.id);
    if (unreadIds.length === 0) return;
    setUndoIds(unreadIds);
    setData((prev) => ({
      ...prev,
      items: prev.items.map((n) => (unreadIds.includes(n.id) ? { ...n, readAt: new Date().toISOString() } : n)),
      unread_count: 0,
    }));
    setToast({ text: 'Notificações marcadas como lidas — Desfazer', duration: 8000 });
    try {
      await api.patch('/notifications/read-bulk', { ids: unreadIds });
      window.dispatchEvent(new CustomEvent('inbox-updated'));
    } catch {
      load();
      setToast(null);
      setUndoIds(null);
    }
  }, [data.items, load]);

  const handleUndo = useCallback(() => {
    if (!undoIds || undoIds.length === 0) return;
    setToast(null);
    api.patch('/notifications/unread-bulk', { ids: undoIds }).then(() => {
      load();
      setUndoIds(null);
      window.dispatchEvent(new CustomEvent('inbox-updated'));
    }).catch(() => load());
  }, [undoIds, load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => { setToast(null); setUndoIds(null); }, toast.duration || 6000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleItemClick = useCallback((n, e) => {
    if (e.target.closest('.inbox-item-mark-read') || e.target.closest('button')) return;
    const href = buildItemLink(n);
    navigate(href);
    if (!n.readAt) markAsRead(n.id, true);
  }, [navigate, markAsRead]);

  const handleItemKeyDown = useCallback((n, e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleItemClick(n, e);
    }
  }, [handleItemClick]);

  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  const hasActiveFilters = range || (type && type !== 'all') || author;

  if (loading && data.items.length === 0) {
    return <div className="page-loading">Carregando...</div>;
  }

  return (
    <div className="page inbox-page">
      <header className="inbox-header">
        <div className="inbox-header-top">
          <h1 className="page-title">Inbox</h1>
          <span className="inbox-counts">
            {unreadCount > 0 && <span className="inbox-count-unread">{unreadCount} não lidas</span>}
            {unreadCount > 0 && data.total_count > 0 && ' · '}
            <span className="inbox-count-total">{data.total_count} total</span>
          </span>
        </div>

        <div className="inbox-toolbar">
          <div className="inbox-tabs" role="tablist" aria-label="Abas da Inbox">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'todas'}
              className={`inbox-tab ${tab === 'todas' ? 'active' : ''}`}
              onClick={() => setFilters({ tab: 'todas' })}
            >
              Todas
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'nao-lidas'}
              className={`inbox-tab ${tab === 'nao-lidas' ? 'active' : ''}`}
              onClick={() => setFilters({ tab: 'nao-lidas' })}
            >
              Não lidas {unreadCount > 0 ? `(${unreadCount})` : ''}
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              className="btn btn-ghost btn-sm inbox-mark-all"
              onClick={markUnreadAsRead}
            >
              Marcar não lidas como lidas ({unreadCount})
            </button>
          )}

          <div className="inbox-filters">
            <span className="inbox-filter-label">Período:</span>
            {['', 'today', 'yesterday', '7d', '15d'].map((r) => (
              <button
                key={r || 'all'}
                type="button"
                className={`inbox-chip ${range === r ? 'active' : ''}`}
                onClick={() => setFilters({ range: r })}
              >
                {r === '' ? 'Todas' : r === 'today' ? 'Hoje' : r === 'yesterday' ? 'Ontem' : r === '7d' ? 'Últimos 7 dias' : 'Últimos 15 dias'}
              </button>
            ))}
            <span className="inbox-filter-label">Tipo:</span>
            <select
              className="inbox-select"
              value={type}
              onChange={(e) => setFilters({ type: e.target.value })}
              aria-label="Filtrar por tipo"
            >
              <option value="all">Todos</option>
              <option value="COMMENT_CREATED">{TYPE_LABELS.COMMENT_CREATED}</option>
              <option value="VERSION_PUBLISHED">{TYPE_LABELS.VERSION_PUBLISHED}</option>
              <option value="STATUS_CHANGED">{TYPE_LABELS.STATUS_CHANGED}</option>
              <option value="MENTION">{TYPE_LABELS.MENTION}</option>
            </select>
            <span className="inbox-filter-label">Autor:</span>
            <select
              className="inbox-select"
              value={author}
              onChange={(e) => setFilters({ author: e.target.value })}
              aria-label="Filtrar por autor"
            >
              <option value="">Qualquer pessoa</option>
              {authors.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {error && <div className="page-error">{error}</div>}

      {tab === 'nao-lidas' && filteredItems.length === 0 && !loading && (
        <div className="inbox-empty-state inbox-empty-unread">
          <p className="inbox-empty-title">Você está em dia 🎉</p>
          <p className="inbox-empty-desc">Nenhuma notificação não lida.</p>
          <Link to="/notifications?tab=todas" className="btn btn-ghost">Ver todas</Link>
        </div>
      )}

      {tab !== 'nao-lidas' && filteredItems.length === 0 && hasActiveFilters && !loading && (
        <div className="inbox-empty-state">
          <p className="inbox-empty-title">Nenhuma notificação encontrada para estes filtros.</p>
          <button type="button" className="btn btn-ghost" onClick={clearFilters}>Limpar filtros</button>
        </div>
      )}

      {tab !== 'nao-lidas' && filteredItems.length === 0 && !hasActiveFilters && !loading && (
        <p className="page-empty">Nenhuma notificação.</p>
      )}

      {filteredItems.length > 0 && (
        <div className="inbox-list-wrap">
          {groups.today.length > 0 && (
            <section className="inbox-group">
              <h2 className="inbox-group-title">Hoje</h2>
              <ul className="inbox-list">
                {groups.today.map((n) => (
                  <NotificationRow
                    key={n.id}
                    n={n}
                    onMarkRead={markAsRead}
                    onClick={handleItemClick}
                    onKeyDown={handleItemKeyDown}
                  />
                ))}
              </ul>
            </section>
          )}
          {groups.yesterday.length > 0 && (
            <section className="inbox-group">
              <h2 className="inbox-group-title">Ontem</h2>
              <ul className="inbox-list">
                {groups.yesterday.map((n) => (
                  <NotificationRow
                    key={n.id}
                    n={n}
                    onMarkRead={markAsRead}
                    onClick={handleItemClick}
                    onKeyDown={handleItemKeyDown}
                  />
                ))}
              </ul>
            </section>
          )}
          {groups.week.length > 0 && (
            <section className="inbox-group">
              <h2 className="inbox-group-title">Esta semana</h2>
              <ul className="inbox-list">
                {groups.week.map((n) => (
                  <NotificationRow
                    key={n.id}
                    n={n}
                    onMarkRead={markAsRead}
                    onClick={handleItemClick}
                    onKeyDown={handleItemKeyDown}
                  />
                ))}
              </ul>
            </section>
          )}
          {groups.older.length > 0 && (
            <section className="inbox-group">
              <h2 className="inbox-group-title">Mais antigas</h2>
              <ul className="inbox-list">
                {groups.older.map((n) => (
                  <NotificationRow
                    key={n.id}
                    n={n}
                    onMarkRead={markAsRead}
                    onClick={handleItemClick}
                    onKeyDown={handleItemKeyDown}
                  />
                ))}
              </ul>
            </section>
          )}

          {data.page_count > 1 && (
            <div className="inbox-pagination">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={data.page <= 1}
                onClick={() => setFilters({ page: String(data.page - 1) })}
              >
                Anterior
              </button>
              <span className="inbox-pagination-info">
                Página {data.page} de {data.page_count}
              </span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={data.page >= data.page_count}
                onClick={() => setFilters({ page: String(data.page + 1) })}
              >
                Próximo
              </button>
            </div>
          )}
        </div>
      )}

      {toast && (
        <div className="inbox-toast" role="status">
          <span>{toast.text}</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleUndo}>Desfazer</button>
        </div>
      )}
    </div>
  );
}

function NotificationRow({ n, onMarkRead, onClick, onKeyDown }) {
  const isUnread = !n.readAt;
  const link = buildItemLink(n);
  const preview = n.previewText ? (n.previewText.slice(0, 120) + (n.previewText.length > 120 ? '…' : '')) : '';

  return (
    <li
      className={`inbox-item ${isUnread ? 'inbox-item-unread' : ''}`}
      tabIndex={0}
      role="button"
      onClick={(e) => onClick(n, e)}
      onKeyDown={(e) => onKeyDown(n, e)}
      aria-label={`${n.componentTitle}: ${getSubtitle(n)}. ${isUnread ? 'Não lida.' : ''}`}
    >
      <div className="inbox-item-indicator" aria-hidden />
      <NotificationIcon type={n.type} />
      <div className="inbox-item-content">
        <div className="inbox-item-title">{n.componentTitle}</div>
        <div className="inbox-item-subtitle">{getSubtitle(n)}</div>
        {preview && <p className="inbox-item-preview">{preview}</p>}
        <time className="inbox-item-time" dateTime={n.createdAt} title={formatDateTime(n.createdAt)}>
          {formatRelative(n.createdAt)}
        </time>
      </div>
      {isUnread && (
        <button
          type="button"
          className="inbox-item-mark-read btn btn-ghost btn-sm"
          onClick={(e) => { e.stopPropagation(); onMarkRead(n.id, true); }}
          aria-label="Marcar como lida"
        >
          Marcar como lida
        </button>
      )}
    </li>
  );
}
