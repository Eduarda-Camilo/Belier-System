import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

  const cancelUrl = isEdit ? `/components/${id}` : '/components';

  return (
    <div className="page page-component-form">
      <form onSubmit={handleSubmit} className="component-form">
        <div className="component-form-header">
          <h1>{isEdit ? 'Editar componente' : 'Novo componente'}</h1>
          <div className="component-form-actions">
            <button type="button" onClick={() => navigate(cancelUrl)} className="btn btn-ghost">Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
        {error && <div className="page-error">{error}</div>}
        <div className="component-form-body">
          <div className="form-row">
            <div className="form-field-label">
              <span className="form-field-name">Nome *</span>
              <span className="form-field-desc">Nome único do componente no design system.</span>
            </div>
            <div className="form-field-input">
              <input name="name" value={form.name} onChange={handleChange} required placeholder="Ex.: botão primário" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field-label">
              <span className="form-field-name">Descrição</span>
              <span className="form-field-desc">Texto que aparece na listagem e na página do componente.</span>
            </div>
            <div className="form-field-input">
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Descreva o uso do componente..." />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field-label">
              <span className="form-field-name">Categoria *</span>
              <span className="form-field-desc">Agrupa o componente (ex.: Botões, Formulários).</span>
            </div>
            <div className="form-field-input">
              <select name="categoryId" value={form.categoryId} onChange={handleChange} required>
                <option value="">Selecione</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-field-label">
              <span className="form-field-name">Status</span>
              <span className="form-field-desc">Rascunho (visível só para quem pode editar), Publicado (visível para todos) ou Arquivado.</span>
            </div>
            <div className="form-field-input">
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="draft">Rascunho</option>
                <option value="published">Publicado</option>
                <option value="archived">Arquivado</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-field-label">
              <span className="form-field-name">Código de uso</span>
              <span className="form-field-desc">Exibido na aba Código e renderizado na Pré-visualização. Use HTML ou snippet de exemplo.</span>
            </div>
            <div className="form-field-input">
              <textarea name="documentation" value={form.documentation} onChange={handleChange} placeholder='Ex.: <button type="submit" class="btn">Salvar</button>' rows={8} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field-label">
              <span className="form-field-name">Variações <span className="form-field-optional">(opcional)</span></span>
              <span className="form-field-desc">JSON com estados ou variações do componente.</span>
            </div>
            <div className="form-field-input">
              <textarea name="variations" value={form.variations} onChange={handleChange} placeholder='{"default": "...", "disabled": "..."}' rows={4} />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
