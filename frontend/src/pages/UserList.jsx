import { useState, useEffect } from 'react';
import api from '../services/api';
import './UserList.css';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', profile: 'developer' });

  const load = () => {
    api.get('/users')
      .then((res) => setUsers(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Erro ao carregar'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Nome, email e senha são obrigatórios.');
      return;
    }
    setError('');
    try {
      await api.post('/users', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        profile: form.profile,
      });
      setForm({ name: '', email: '', password: '', profile: 'developer' });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar usuário');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingId || !form.name.trim() || !form.email.trim()) return;
    setError('');
    try {
      await api.put(`/users/${editingId}`, {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password.trim() || undefined,
        profile: form.profile,
      });
      setEditingId(null);
      setForm({ name: '', email: '', password: '', profile: 'developer' });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao atualizar');
    }
  };

  const startEdit = (u) => {
    setEditingId(u.id);
    setForm({ name: u.name, email: u.email, password: '', profile: u.profile });
    setShowForm(false);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ name: '', email: '', password: '', profile: 'developer' });
  };

  const profileLabel = { admin: 'Admin', designer: 'Designer', developer: 'Desenvolvedor' };

  if (loading) return <div className="page-loading">Carregando...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Usuários</h1>
        <button type="button" className="btn btn-primary" onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: '', email: '', password: '', profile: 'developer' }); }}>
          Novo usuário
        </button>
      </div>
      {error && <div className="page-error">{error}</div>}
      {(showForm || editingId) && (
        <form onSubmit={editingId ? handleUpdate : handleCreate} className="user-form card">
          <h3>{editingId ? 'Editar usuário' : 'Novo usuário'}</h3>
          <label>Nome * <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required /></label>
          <label>E-mail * <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required /></label>
          <label>Senha {editingId ? '(deixe em branco para não alterar)' : '*'} <input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required={!editingId} /></label>
          <label>Perfil <select value={form.profile} onChange={(e) => setForm((f) => ({ ...f, profile: e.target.value }))}>
            <option value="admin">Admin</option>
            <option value="designer">Designer</option>
            <option value="developer">Desenvolvedor</option>
          </select></label>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">{editingId ? 'Salvar' : 'Criar'}</button>
            <button type="button" className="btn btn-ghost" onClick={cancelForm}>Cancelar</button>
          </div>
        </form>
      )}
      <div className="user-table-wrap">
        <table className="user-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Perfil</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{profileLabel[u.profile]}</td>
                <td>
                  <button type="button" className="btn btn-ghost" onClick={() => startEdit(u)}>Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {users.length === 0 && !showForm && <p className="page-empty">Nenhum usuário.</p>}
    </div>
  );
}
