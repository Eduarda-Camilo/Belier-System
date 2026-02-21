import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './ComponentList.css';

export default function ComponentList() {
  const { user } = useAuth();
  const [components, setComponents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ categoryId: '', status: '', q: '' });

  const canEdit = ['admin', 'designer'].includes(user?.profile);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filters.categoryId) params.categoryId = filters.categoryId;
    if (filters.status) params.status = filters.status;
    if (filters.q?.trim()) params.q = filters.q.trim();
    api.get('/components', { params })
      .then((res) => setComponents(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Erro ao carregar componentes'))
      .finally(() => setLoading(false));
  }, [filters.categoryId, filters.status, filters.q]);

  const statusLabel = { draft: 'Rascunho', published: 'Publicado', archived: 'Arquivado' };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Componentes</h1>
        {canEdit && (
          <Link to="/components/new" className="btn btn-primary">Novo componente</Link>
        )}
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Buscar por nome ou descrição"
          value={filters.q}
          onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
          className="filter-input"
        />
        <select
          value={filters.categoryId}
          onChange={(e) => setFilters((f) => ({ ...f, categoryId: e.target.value }))}
          className="filter-select"
        >
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          className="filter-select"
        >
          <option value="">Todos os status</option>
          <option value="draft">Rascunho</option>
          <option value="published">Publicado</option>
          <option value="archived">Arquivado</option>
        </select>
      </div>

      {error && <div className="page-error">{error}</div>}
      {loading && <div className="page-loading">Carregando...</div>}
      {!loading && !error && (
        <div className="card-grid">
          {components.length === 0 ? (
            <p className="page-empty">Nenhum componente encontrado.</p>
          ) : (
            components.map((comp) => (
              <div key={comp.id} className="card">
                <div className="card-header">
                  <Link to={`/components/${comp.id}`} className="card-title">{comp.title || comp.name}</Link>
                  <span className={`card-badge card-badge-${comp.status}`}>
                    {statusLabel[comp.status]}
                  </span>
                </div>
                {comp.Category && <span className="card-meta">{comp.Category.name}</span>}
                {comp.responsible && (
                  <span className="card-meta">Responsável: {comp.responsible.name}</span>
                )}
                {(comp.shortDescription || comp.description) && (
                  <p className="card-desc">{(comp.shortDescription || comp.description).slice(0, 100)}
                    {(comp.shortDescription || comp.description).length > 100 ? '...' : ''}</p>
                )}
                <div className="card-actions">
                  <Link to={`/components/${comp.id}`} className="btn btn-ghost">Ver</Link>
                  {canEdit && (
                    <Link to={`/components/${comp.id}/edit`} className="btn btn-ghost">Editar</Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
