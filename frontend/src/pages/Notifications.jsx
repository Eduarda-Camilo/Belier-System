import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Notifications.css';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    api.get('/notifications')
      .then((res) => setNotifications(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Erro ao carregar'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch {}
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) return <div className="page-loading">Carregando...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Inbox</h1>
        {unreadCount > 0 && (
          <button type="button" className="btn btn-ghost" onClick={markAllAsRead}>
            Marcar todas como lidas
          </button>
        )}
      </div>
      {error && <div className="page-error">{error}</div>}
      {notifications.length === 0 ? (
        <p className="page-empty">Nenhuma notificação.</p>
      ) : (
        <ul className="notification-list">
          {notifications.map((n) => (
            <li key={n.id} className={`notification-item card ${n.read ? 'notification-read' : ''}`}>
              <div className="notification-body">
                <p className="notification-text">
                  Novo comentário em <Link to={`/components/${n.Component?.id}`}>{n.Component?.name || 'componente'}</Link>
                  {n.Comment?.User?.name && ` por ${n.Comment.User.name}`}.
                </p>
                {n.Comment?.text && (
                  <blockquote className="notification-quote">"{n.Comment.text.slice(0, 120)}{n.Comment.text.length > 120 ? '...' : ''}"</blockquote>
                )}
                <span className="notification-date">{new Date(n.createdAt).toLocaleString('pt-BR')}</span>
              </div>
              {!n.read && (
                <button type="button" className="btn btn-ghost" onClick={() => markAsRead(n.id)}>
                  Marcar como lida
                </button>
              )}
              <Link to={`/components/${n.Component?.id}`} className="btn btn-primary">Ver componente</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
