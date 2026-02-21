import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './ComponentForm.css';

export default function ComponentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    categoryId: '',
    status: 'draft',
    documentation: '',
    variations: '',
  });

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) return;
    api.get(`/components/${id}`)
      .then((res) => {
        const c = res.data;
        setForm({
          name: c.name || '',
          description: c.description || '',
          categoryId: String(c.categoryId || ''),
          status: c.status || 'draft',
          documentation: c.documentation || '',
          variations: typeof c.variations === 'object' && c.variations
            ? JSON.stringify(c.variations, null, 2)
            : '',
        });
      })
      .catch((err) => setError(err.response?.data?.error || 'Erro ao carregar'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    let payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      status: form.status,
      documentation: form.documentation.trim() || null,
    };
    let variations = null;
    if (form.variations.trim()) {
      try {
        variations = JSON.parse(form.variations);
      } catch {
        setError('Variações devem ser um JSON válido.');
        setSaving(false);
        return;
      }
    }
    payload.variations = variations;
    try {
      if (isEdit) {
        await api.put(`/components/${id}`, payload);
        navigate(`/components/${id}`);
      } else {
        const { data } = await api.post('/components', payload);
        navigate(`/components/${data.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-loading">Carregando...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>{isEdit ? 'Editar componente' : 'Novo componente'}</h1>
        <Link to={isEdit ? `/components/${id}` : '/components'} className="btn btn-ghost">Cancelar</Link>
      </div>
      {error && <div className="page-error">{error}</div>}
      <form onSubmit={handleSubmit} className="form">
        <label>
          Nome *
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label>
          Descrição
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} />
        </label>
        <label>
          Categoria *
          <select name="categoryId" value={form.categoryId} onChange={handleChange} required>
            <option value="">Selecione</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
            <option value="archived">Arquivado</option>
          </select>
        </label>
        <label>
          Documentação (texto ou HTML)
          <textarea name="documentation" value={form.documentation} onChange={handleChange} rows={6} />
        </label>
        <label>
          Variações (JSON, opcional)
          <textarea name="variations" value={form.variations} onChange={handleChange} placeholder='{"default": "...", "disabled": "..."}' rows={4} />
        </label>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Salvando...' : (isEdit ? 'Salvar' : 'Criar')}
          </button>
        </div>
      </form>
    </div>
  );
}
