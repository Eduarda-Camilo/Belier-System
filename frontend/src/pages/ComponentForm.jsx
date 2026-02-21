import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './ComponentForm.css';

const slugify = (s) => (s || '').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

function ChipsInput({ values, onChange, placeholder, parseToken }) {
  const [input, setInput] = useState('');
  const add = (raw) => {
    const token = parseToken ? parseToken(raw) : raw.trim();
    if (token && !values.includes(token)) onChange([...values, token]);
    setInput('');
  };
  return (
    <div className="chips-wrap">
      {values.map((v, i) => (
        <span key={i} className="chip">
          {v}
          <button type="button" className="chip-remove" onClick={() => onChange(values.filter((_, j) => j !== i))} aria-label="Remover">×</button>
        </span>
      ))}
      <input
        type="text"
        className="chips-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(input); } }}
        onBlur={() => input.trim() && add(input)}
        placeholder={placeholder}
      />
    </div>
  );
}

function generateSnippet(importName, propsTokens) {
  const name = importName || 'Component';
  if (!propsTokens || propsTokens.length === 0) return `<${name} />`;
  const parts = [];
  for (const t of propsTokens) {
    const eq = t.indexOf(':');
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    const val = t.slice(eq + 1).trim();
    if (val === 'true' || val === 'false') parts.push(val === 'true' ? key : null);
    else parts.push(`${key}=${JSON.stringify(val)}`);
  }
  const attrs = parts.filter(Boolean).join(' ');
  return attrs ? `<${name} ${attrs} />` : `<${name} />`;
}

export default function ComponentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    shortDescription: '',
    slug: '',
    categoryId: '',
    tags: [],
    importName: '',
    referenceUrl: '',
    status: 'draft',
  });
  const [defaultExample, setDefaultExample] = useState({
    propsTokens: [],
    codeSnippet: '',
    codeCustom: false,
  });
  const [variations, setVariations] = useState([]);
  const [examplesLoaded, setExamplesLoaded] = useState(false);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  const loadComponent = useCallback(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/components/${id}?include=examples`)
      .then((res) => {
        const c = res.data;
        setForm({
          title: c.title || c.name || '',
          shortDescription: c.shortDescription || c.description || '',
          slug: c.slug || '',
          categoryId: String(c.categoryId || ''),
          tags: Array.isArray(c.tags) ? c.tags : [],
          importName: c.importName || '',
          referenceUrl: c.referenceUrl || '',
          status: c.status || 'draft',
        });
        const def = c.defaultExample || c.default;
        if (def) {
          setDefaultExample({
            id: def.id,
            propsTokens: Array.isArray(def.propsTokens) ? def.propsTokens : [],
            codeSnippet: def.codeSnippet || '',
            codeCustom: Boolean(def.codeCustom),
          });
        } else {
          setDefaultExample({ propsTokens: [], codeSnippet: '', codeCustom: false });
        }
        const vars = c.variations || [];
        setVariations(vars.map((v, i) => ({
          id: v.id,
          title: v.title || '',
          description: v.description || '',
          order: v.order ?? i,
          propsTokens: Array.isArray(v.propsTokens) ? v.propsTokens : [],
          codeSnippet: v.codeSnippet || '',
          codeCustom: Boolean(v.codeCustom),
        })));
        setExamplesLoaded(true);
      })
      .catch((err) => setError(err.response?.data?.error || 'Erro ao carregar'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (id) loadComponent();
    else setLoading(false);
  }, [id, loadComponent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (name === 'title' && !form.slug) setForm((f) => ({ ...f, slug: slugify(value) }));
  };

  const suggestSlug = () => setForm((f) => ({ ...f, slug: slugify(f.title) }));

  const saveComponent = async (payload) => {
    if (isEdit) {
      await api.put(`/components/${id}`, payload);
      return id;
    }
    const { data } = await api.post('/components', payload);
    return data.id;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        shortDescription: form.shortDescription.trim(),
        slug: form.slug.trim().toLowerCase(),
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        tags: form.tags,
        importName: form.importName.trim() || null,
        referenceUrl: form.referenceUrl.trim() || null,
        status: form.status,
      };
      if (payload.title.length < 2) {
        setError('Título deve ter no mínimo 2 caracteres.');
        setSaving(false);
        return;
      }
      if (payload.shortDescription.length < 10) {
        setError('Descrição curta deve ter no mínimo 10 caracteres.');
        setSaving(false);
        return;
      }
      const componentId = await saveComponent(payload);

      if (!isEdit) {
        await api.post(`/components/${componentId}/examples`, {
          type: 'default',
          title: 'Default',
          propsTokens: defaultExample.propsTokens,
          codeSnippet: defaultExample.codeSnippet || generateSnippet(form.importName, defaultExample.propsTokens),
          codeCustom: defaultExample.codeCustom,
        });
        navigate(`/components/${componentId}/edit`, { replace: true });
      } else {
        await saveDefaultExample(componentId);
        await saveVariations(componentId);
        navigate(`/components/${componentId}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const saveDefaultExample = async (componentId) => {
    const snippet = defaultExample.codeCustom
      ? defaultExample.codeSnippet
      : generateSnippet(form.importName, defaultExample.propsTokens);
    const payload = {
      type: 'default',
      title: 'Default',
      propsTokens: defaultExample.propsTokens,
      codeSnippet: snippet || defaultExample.codeSnippet,
      codeCustom: defaultExample.codeCustom,
    };
    if (defaultExample.id) {
      await api.put(`/components/${componentId}/examples/${defaultExample.id}`, payload);
    } else {
      await api.post(`/components/${componentId}/examples`, payload);
    }
  };

  const saveVariations = async (componentId) => {
    const list = await api.get(`/components/${componentId}/examples`).then((r) => r.data.variations || []);
    const byId = list.reduce((acc, v) => { acc[v.id] = v; return acc; }, {});
    for (let i = 0; i < variations.length; i++) {
      const v = variations[i];
      const snippet = v.codeCustom ? v.codeSnippet : generateSnippet(form.importName, v.propsTokens);
      const payload = {
        type: 'variation',
        title: v.title,
        description: v.description || null,
        order: i,
        propsTokens: v.propsTokens,
        codeSnippet: snippet || v.codeSnippet,
        codeCustom: v.codeCustom,
      };
      if (v.id && byId[v.id]) {
        await api.put(`/components/${componentId}/examples/${v.id}`, payload);
      } else {
        await api.post(`/components/${componentId}/examples`, { ...payload, order: i });
      }
    }
  };

  const handleSaveAndStay = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        shortDescription: form.shortDescription.trim(),
        slug: form.slug.trim().toLowerCase(),
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        tags: form.tags,
        importName: form.importName.trim() || null,
        referenceUrl: form.referenceUrl.trim() || null,
        status: form.status,
      };
      const componentId = await saveComponent(payload);
      if (!isEdit) {
        navigate(`/components/${componentId}/edit`, { replace: true });
        setSaving(false);
        return;
      }
      await saveDefaultExample(componentId);
      await saveVariations(componentId);
      loadComponent();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const regenDefaultCode = () => {
    const snippet = generateSnippet(form.importName, defaultExample.propsTokens);
    setDefaultExample((d) => ({ ...d, codeSnippet: snippet, codeCustom: false }));
  };

  const addVariation = () => {
    setVariations((v) => [...v, {
      title: '',
      description: '',
      order: v.length,
      propsTokens: [],
      codeSnippet: '',
      codeCustom: false,
    }]);
  };

  const updateVariation = (index, field, value) => {
    setVariations((v) => v.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const duplicateVariation = (index) => {
    const src = variations[index];
    setVariations((v) => [
      ...v.slice(0, index + 1),
      { ...src, id: undefined, title: (src.title || '') + ' (cópia)', order: index + 1 },
      ...v.slice(index + 1).map((x, i) => ({ ...x, order: index + 2 + i })),
    ]);
  };

  const removeVariation = (index) => {
    setVariations((v) => v.filter((_, i) => i !== index).map((x, i) => ({ ...x, order: i })));
  };

  const moveVariation = (index, dir) => {
    const next = index + dir;
    if (next < 0 || next >= variations.length) return;
    setVariations((v) => {
      const copy = [...v];
      [copy[index], copy[next]] = [copy[next], copy[index]];
      return copy.map((x, i) => ({ ...x, order: i }));
    });
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
            {isEdit && (
              <button type="button" className="btn btn-ghost" onClick={handleSaveAndStay} disabled={saving}>
                Salvar e continuar
              </button>
            )}
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
        {error && <div className="page-error">{error}</div>}
        <div className="component-form-body">
          <div className="form-row">
            <div className="form-field-label">
              <span className="form-field-name">Título *</span>
              <span className="form-field-desc">Nome do componente no catálogo.</span>
            </div>
            <div className="form-field-input">
              <input name="title" value={form.title} onChange={handleChange} required placeholder="Ex.: Botão primário" minLength={2} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field-label">
              <span className="form-field-name">Descrição curta *</span>
              <span className="form-field-desc">Texto que aparece na listagem (mín. 10 caracteres).</span>
            </div>
            <div className="form-field-input">
              <textarea name="shortDescription" value={form.shortDescription} onChange={handleChange} rows={3} placeholder="Descreva o uso do componente..." minLength={10} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field-label">
              <span className="form-field-name">Slug *</span>
              <span className="form-field-desc">Identificador único na URL (só letras minúsculas, números e hífen).</span>
            </div>
            <div className="form-field-input form-field-slug">
              <input name="slug" value={form.slug} onChange={handleChange} required placeholder="ex.: botao-primario" pattern="[a-z0-9-]+" />
              <button type="button" className="btn btn-ghost btn-sm" onClick={suggestSlug}>Gerar do título</button>
            </div>
          </div>
          <div className="form-row">
            <div className="form-field-label">
              <span className="form-field-name">Categoria <span className="form-field-optional">(opcional)</span></span>
              <span className="form-field-desc">Agrupa o componente (ex.: Botões, Formulários).</span>
            </div>
            <div className="form-field-input">
              <select name="categoryId" value={form.categoryId} onChange={handleChange}>
                <option value="">Selecione</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-field-label">
              <span className="form-field-name">Tags <span className="form-field-optional">(opcional)</span></span>
              <span className="form-field-desc">Lista de tags para busca.</span>
            </div>
            <div className="form-field-input">
              <ChipsInput values={form.tags} onChange={(tags) => setForm((f) => ({ ...f, tags }))} placeholder="Digite e Enter para adicionar" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field-label">
              <span className="form-field-name">Nome técnico <span className="form-field-optional">(opcional)</span></span>
              <span className="form-field-desc">Nome no código (ex.: Button). Usado para gerar snippet.</span>
            </div>
            <div className="form-field-input">
              <input name="importName" value={form.importName} onChange={handleChange} placeholder="Ex.: Button" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field-label">
              <span className="form-field-name">Link de referência <span className="form-field-optional">(opcional)</span></span>
              <span className="form-field-desc">Figma, doc ou repositório.</span>
            </div>
            <div className="form-field-input">
              <input name="referenceUrl" value={form.referenceUrl} onChange={handleChange} type="url" placeholder="https://..." />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field-label">
              <span className="form-field-name">Status</span>
              <span className="form-field-desc">Rascunho, Publicado (exige Default preenchido) ou Arquivado.</span>
            </div>
            <div className="form-field-input">
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="draft">Rascunho</option>
                <option value="published">Publicado</option>
                <option value="archived">Arquivado</option>
              </select>
            </div>
          </div>

          {/* Exemplo Default */}
          <section className="form-section">
            <h2 className="form-section-title">Exemplo Default</h2>
            <p className="form-section-desc">Obrigatório para publicar. Props (chips) e código; use "Regerar código" para gerar a partir dos props.</p>
            <div className="form-row">
              <div className="form-field-label">
                <span className="form-field-name">Props (chips)</span>
                <span className="form-field-desc">Ex.: size:sm, disabled:true</span>
              </div>
              <div className="form-field-input">
                <ChipsInput
                  values={defaultExample.propsTokens}
                  onChange={(propsTokens) => setDefaultExample((d) => ({ ...d, propsTokens }))}
                  placeholder="chave:valor ou chave:true"
                  parseToken={(t) => t.trim()}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field-label">
                <span className="form-field-name">Código</span>
                <span className="form-field-desc">Gerado a partir dos props ou edite manualmente (marca como custom).</span>
              </div>
              <div className="form-field-input">
                <textarea
                  value={defaultExample.codeSnippet}
                  onChange={(e) => setDefaultExample((d) => ({ ...d, codeSnippet: e.target.value, codeCustom: true }))}
                  placeholder="<Button />"
                  rows={4}
                  className="code-snippet-textarea"
                />
                <button type="button" className="btn btn-ghost btn-sm" onClick={regenDefaultCode}>Regerar código</button>
              </div>
            </div>
          </section>

          {/* Variações */}
          <section className="form-section">
            <div className="form-section-header">
              <h2 className="form-section-title">Variações</h2>
              <button type="button" className="btn btn-primary btn-sm" onClick={addVariation}>Adicionar variação</button>
            </div>
            <p className="form-section-desc">Cada variação tem título, descrição, props e código.</p>
            {variations.length === 0 ? (
              <p className="form-empty-hint">Nenhuma variação. Clique em &quot;Adicionar variação&quot;.</p>
            ) : (
              <ul className="variations-list">
                {variations.map((v, i) => (
                  <li key={v.id || i} className="variation-card">
                    <div className="variation-card-header">
                      <span className="variation-card-title">{v.title || `Variação ${i + 1}`}</span>
                      <div className="variation-card-actions">
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => moveVariation(i, -1)} disabled={i === 0}>↑</button>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => moveVariation(i, 1)} disabled={i === variations.length - 1}>↓</button>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => duplicateVariation(i)}>Duplicar</button>
                        <button type="button" className="btn btn-ghost btn-sm btn-danger-sm" onClick={() => removeVariation(i)}>Excluir</button>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-field-label">
                        <span className="form-field-name">Título *</span>
                      </div>
                      <div className="form-field-input">
                        <input value={v.title} onChange={(e) => updateVariation(i, 'title', e.target.value)} placeholder="Ex.: Desabilitado" />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-field-label">
                        <span className="form-field-name">Descrição</span>
                      </div>
                      <div className="form-field-input">
                        <textarea value={v.description} onChange={(e) => updateVariation(i, 'description', e.target.value)} rows={2} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-field-label">
                        <span className="form-field-name">Props (chips)</span>
                      </div>
                      <div className="form-field-input">
                        <ChipsInput
                          values={v.propsTokens}
                          onChange={(propsTokens) => updateVariation(i, 'propsTokens', propsTokens)}
                          placeholder="chave:valor"
                          parseToken={(t) => t.trim()}
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-field-label">
                        <span className="form-field-name">Código</span>
                      </div>
                      <div className="form-field-input">
                        <textarea
                          value={v.codeSnippet}
                          onChange={(e) => updateVariation(i, 'codeSnippet', e.target.value) || updateVariation(i, 'codeCustom', true)}
                          rows={3}
                          className="code-snippet-textarea"
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </form>
    </div>
  );
}
