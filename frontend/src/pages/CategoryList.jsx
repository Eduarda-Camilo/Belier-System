import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './CategoryList.css';

export default function CategoryList() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [showNew, setShowNew] = useState(false);

  const canEdit = ['admin', 'designer'].includes(user?.profile);

  const load = () => {
    api.get('/categories')
      .then((res) => setCategories(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Erro ao carregar'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setError('');
    try {
      await api.post('/categories', { name: form.name.trim(), description: form.description.trim() || null });
      setForm({ name: '', description: '' });
      setShowNew(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingId || !form.name.trim()) return;
    setError('');
    try {
      await api.put(`/categories/${editingId}`, { name: form.name.trim(), description: form.description.trim() || null });
      setEditingId(null);
      setForm({ name: '', description: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao atualizar');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir esta categoria?')) return;
    setError('');
    try {
      await api.delete(`/categories/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao excluir (pode haver componentes vinculados).');
    }
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setForm({ name: c.name, description: c.description || '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowNew(false);
    setForm({ name: '', description: '' });
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Categorias</h1>
        {canEdit && (
          <button type="button" className="btn btn-primary" onClick={() => { setShowNew(true); setEditingId(null); setForm({ name: '', description: '' }); }}>
            Nova categoria
          </button>
        )}
      </div>
      {error && <div className="page-error">{error}</div>}
      {loading && <div className="page-loading">Carregando...</div>}
      {!loading && (
        <>
          {showNew && (
            <form onSubmit={handleCreate} className="category-form card">
              <h3>Nova categoria</h3>
              <input
                placeholder="Nome *"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
              <input
                placeholder="Descrição (opcional)"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Criar</button>
                <button type="button" className="btn btn-ghost" onClick={cancelEdit}>Cancelar</button>
              </div>
            </form>
          )}
          <ul className="category-list">
            {categories.map((c) => (
              <li key={c.id} className="card category-item">
                {editingId === c.id ? (
                  <form onSubmit={handleUpdate}>
                    <input
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      required
                    />
                    <input
                      placeholder="Descrição"
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    />
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary">Salvar</button>
                      <button type="button" className="btn btn-ghost" onClick={cancelEdit}>Cancelar</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="category-item-main">
                      <strong>{c.name}</strong>
                      {c.description && <span className="category-desc">{c.description}</span>}
                    </div>
                    {canEdit && (
                      <div className="category-item-actions">
                        <button type="button" className="btn btn-ghost" onClick={() => startEdit(c)}>Editar</button>
                        <button type="button" className="btn btn-ghost btn-danger" onClick={() => handleDelete(c.id)}>Excluir</button>
                      </div>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
          {categories.length === 0 && !showNew && <p className="page-empty">Nenhuma categoria. {canEdit && 'Crie uma acima.'}</p>}
        </>
      )}
    </div>
  );
}
