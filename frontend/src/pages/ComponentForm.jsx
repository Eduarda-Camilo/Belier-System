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

const SLUG_REGEX = /^[a-z0-9-]+$/;

export default function ComponentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [slugCheck, setSlugCheck] = useState(null);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [publishChangelog, setPublishChangelog] = useState('');
  const [form, setForm] = useState({
    title: '',
    shortDescription: '',
    slug: '',
    tags: [],
    referenceUrl: '',
    longDescriptionMd: '',
    dependenciesMd: '',
    accessibilityMd: '',
  });
  const [defaultExample, setDefaultExample] = useState({
    id: null,
    codeSnippet: '',
    codeCss: '',
    codeJs: '',
  });
  const [variations, setVariations] = useState([]);
  const [variationCollapsed, setVariationCollapsed] = useState({});

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
          tags: Array.isArray(c.tags) ? c.tags : [],
          referenceUrl: c.referenceUrl || '',
          longDescriptionMd: c.longDescriptionMd || c.documentation || '',
          dependenciesMd: c.dependenciesMd || '',
          accessibilityMd: c.accessibilityMd || '',
        });
        const def = c.defaultExample || c.default;
        if (def) {
          setDefaultExample({
            id: def.id,
            codeSnippet: def.codeSnippet || '',
            codeCss: def.codeCss || '',
            codeJs: def.codeJs || '',
          });
        } else {
          setDefaultExample({ id: null, codeSnippet: '', codeCss: '', codeJs: '' });
        }
        const vars = c.variations || [];
        setVariations(vars.map((v, i) => ({
          id: v.id,
          title: v.title || '',
          slug: v.slug || slugify(v.title || `var-${i + 1}`),
          description: v.description || '',
          order: i,
          codeSnippet: v.codeSnippet || '',
          codeCss: v.codeCss || '',
          codeJs: v.codeJs || '',
        })));
      })
      .catch((err) => setError(err.response?.data?.error || 'Erro ao carregar'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (id) loadComponent();
    else setLoading(false);
  }, [id, loadComponent]);

  useEffect(() => {
    if (!form.slug || form.slug.length < 2) {
      setSlugCheck(null);
      return;
    }
    if (!SLUG_REGEX.test(form.slug)) {
      setSlugCheck({ available: false, error: 'Apenas letras minúsculas, números e hífen' });
      return;
    }
    const excludeId = isEdit ? id : null;
    const q = excludeId ? `?slug=${encodeURIComponent(form.slug)}&excludeId=${excludeId}` : `?slug=${encodeURIComponent(form.slug)}`;
    api.get(`/components/check-slug${q}`)
      .then((r) => setSlugCheck(r.data))
      .catch(() => setSlugCheck(null));
  }, [form.slug, isEdit, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (name === 'title' && !form.slug) setForm((f) => ({ ...f, slug: slugify(value) }));
  };

  const suggestSlug = () => setForm((f) => ({ ...f, slug: slugify(f.title) }));

  const canPublish = () => {
    if (!form.title.trim() || form.title.length < 2) return false;
    if (!form.shortDescription.trim() || form.shortDescription.length < 10) return false;
    if (!slugCheck || !slugCheck.available) return false;
    if (!form.tags || form.tags.length < 1) return false;
    if (!defaultExample.codeSnippet || !defaultExample.codeSnippet.trim()) return false;
    return true;
  };

  const saveDraft = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        shortDescription: form.shortDescription.trim(),
        slug: form.slug.trim().toLowerCase(),
        tags: form.tags,
        referenceUrl: form.referenceUrl.trim() || null,
        longDescriptionMd: form.longDescriptionMd.trim() || null,
        dependenciesMd: form.dependenciesMd.trim() || null,
        accessibilityMd: form.accessibilityMd.trim() || null,
        status: 'draft',
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
      if (!payload.tags || payload.tags.length < 1) {
        setError('Informe ao menos uma tag.');
        setSaving(false);
        return;
      }
      const t = payload.slug.trim().toLowerCase();
      if (t.length < 2) {
        setError('Slug deve ter no mínimo 2 caracteres.');
        setSaving(false);
        return;
      }
      if (!SLUG_REGEX.test(t)) {
        setError('Slug deve conter apenas letras minúsculas, números e hífen.');
        setSaving(false);
        return;
      }
      if (slugCheck && !slugCheck.available) {
        setError('Este slug já está em uso.');
        setSaving(false);
        return;
      }
      let componentId;
      if (isEdit) {
        await api.put(`/components/${id}`, payload);
        componentId = id;
      } else {
        const { data } = await api.post('/components', payload);
        componentId = data.id;
      }
      await saveDefaultExample(componentId);
      await saveVariations(componentId);
      if (!isEdit) {
        try {
          await api.post(`/versions/component/${componentId}`, { description: 'Versão 1' });
        } catch (_) {}
        navigate(`/components/${componentId}/edit`, { replace: true });
      } else {
        loadComponent();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const saveDefaultExample = async (componentId) => {
    const payload = {
      type: 'default',
      title: 'Default',
      slug: 'default',
      codeSnippet: defaultExample.codeSnippet || '',
      codeCss: defaultExample.codeCss || null,
      codeJs: defaultExample.codeJs || null,
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
      const payload = {
        type: 'variation',
        title: v.title,
        slug: (v.slug || slugify(v.title) || `var-${i + 1}`).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: v.description || null,
        order: i,
        codeSnippet: v.codeSnippet || '',
        codeCss: v.codeCss || null,
        codeJs: v.codeJs || null,
      };
      if (v.id && byId[v.id]) {
        await api.put(`/components/${componentId}/examples/${v.id}`, payload);
      } else {
        await api.post(`/components/${componentId}/examples`, { ...payload, order: i });
      }
    }
  };

  const handlePublish = async () => {
    if (!publishChangelog.trim()) return;
    setError('');
    setSaving(true);
    try {
      await api.post(`/components/${id}/publish`, { changelog: publishChangelog.trim() });
      setPublishModalOpen(false);
      setPublishChangelog('');
      navigate(`/components/${id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao publicar');
    } finally {
      setSaving(false);
    }
  };

  const addVariation = () => {
    setVariations((v) => [...v, {
      title: '',
      slug: '',
      description: '',
      order: v.length,
      codeSnippet: '',
      codeCss: '',
      codeJs: '',
    }]);
  };

  const updateVariation = (index, field, value) => {
    setVariations((v) => v.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
    if (field === 'title') {
      const newSlug = slugify(value);
      if (newSlug) setVariations((prev) => prev.map((item, i) => (i === index && !item.slug ? { ...item, slug: newSlug } : item)));
    }
  };

  const duplicateVariation = (index) => {
    const src = variations[index];
    setVariations((v) => [
      ...v.slice(0, index + 1),
      { ...src, id: undefined, title: (src.title || '') + ' (cópia)', slug: ((src.slug || '').replace(/-copia\d*$/, '') || 'var') + '-copia', order: index + 1 },
      ...v.slice(index + 1).map((x, i) => ({ ...x, order: index + 2 + i })),
    ]);
  };

  const removeVariation = (index) => {
    setVariations((v) => v.filter((_, i) => i !== index).map((x, i) => ({ ...x, order: i })));
  };

  const toggleVariationCollapsed = (key) => {
    setVariationCollapsed((c) => ({ ...c, [key]: !c[key] }));
  };

  if (loading) return <div className="page-loading">Carregando...</div>;

  const cancelUrl = isEdit ? `/components/${id}` : '/';

  return (
    <div className="page page-component-form">
      <div className="component-form">
        <div className="component-form-header">
          <h1 className="page-title">{isEdit ? 'Editar componente' : 'Novo componente'}</h1>
          <div className="component-form-actions">
            <button type="button" onClick={() => navigate(cancelUrl)} className="btn btn-ghost">Cancelar</button>
            <button type="button" className="btn btn-ghost" onClick={saveDraft} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar rascunho'}
            </button>
            {isEdit && (
              <button
                type="button"
                className="btn btn-primary"
                disabled={saving || !canPublish()}
                onClick={() => setPublishModalOpen(true)}
              >
                Publicar
              </button>
            )}
          </div>
        </div>
        {error && <div className="page-error">{error}</div>}
        <div className="component-form-body">
          {/* Bloco 1: Informações básicas */}
          <section className="form-section">
            <h2 className="form-section-title">Informações básicas</h2>
            <div className="form-row">
              <div className="form-field-label">
                <span className="form-field-name">Título *</span>
              </div>
              <div className="form-field-input">
                <input name="title" value={form.title} onChange={handleChange} required placeholder="Ex.: Botão primário" minLength={2} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field-label">
                <span className="form-field-name">Slug *</span>
                <span className="form-field-desc">Identificador único (apenas letras minúsculas, números e hífen).</span>
              </div>
              <div className="form-field-input form-field-slug">
                <input name="slug" value={form.slug} onChange={handleChange} required placeholder="ex.: botao-primario" pattern="[a-z0-9\-]+" title="Apenas letras minúsculas, números e hífen" />
                <button type="button" className="btn btn-ghost btn-sm" onClick={suggestSlug}>Gerar do título</button>
              </div>
            </div>
            {form.slug && (
              <p className="form-helper form-helper-slug">
                {slugCheck === null ? 'Verificando...' : slugCheck.available ? 'Slug disponível' : (slugCheck.error || 'Slug já existe')}
              </p>
            )}
            <div className="form-row">
              <div className="form-field-label">
                <span className="form-field-name">Descrição curta *</span>
                <span className="form-field-desc">Mínimo 10 caracteres.</span>
              </div>
              <div className="form-field-input">
                <textarea name="shortDescription" value={form.shortDescription} onChange={handleChange} rows={3} placeholder="Descreva o uso do componente..." minLength={10} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field-label">
                <span className="form-field-name">Tags *</span>
                <span className="form-field-desc">Use tags para facilitar a busca (ex.: formulário, navegação, feedback). Mínimo 1.</span>
              </div>
              <div className="form-field-input">
                <ChipsInput values={form.tags} onChange={(tags) => setForm((f) => ({ ...f, tags }))} placeholder="Digite e Enter para adicionar" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field-label">
                <span className="form-field-name">Link de referência <span className="form-field-optional">(opcional)</span></span>
              </div>
              <div className="form-field-input">
                <input name="referenceUrl" value={form.referenceUrl} onChange={handleChange} type="url" placeholder="https://..." />
              </div>
            </div>
          </section>

          {/* Bloco 2: Documentação (Markdown) */}
          <section className="form-section">
            <h2 className="form-section-title">Documentação (Markdown)</h2>
            <div className="form-row">
              <div className="form-field-label">
                <span className="form-field-name">Descrição longa <span className="form-field-optional">(opcional)</span></span>
                <span className="form-field-desc">Quando usar / Quando não usar…</span>
              </div>
              <div className="form-field-input">
                <textarea name="longDescriptionMd" value={form.longDescriptionMd} onChange={handleChange} rows={5} placeholder="Quando usar / Quando não usar…" className="code-snippet-textarea" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field-label">
                <span className="form-field-name">Dependências <span className="form-field-optional">(opcional)</span></span>
                <span className="form-field-desc">Tokens, framework, dados necessários…</span>
              </div>
              <div className="form-field-input">
                <textarea name="dependenciesMd" value={form.dependenciesMd} onChange={handleChange} rows={3} placeholder="Tokens, framework, dados necessários…" className="code-snippet-textarea" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field-label">
                <span className="form-field-name">Acessibilidade <span className="form-field-optional">(opcional)</span></span>
                <span className="form-field-desc">Teclado, foco, aria-label, contraste…</span>
              </div>
              <div className="form-field-input">
                <textarea name="accessibilityMd" value={form.accessibilityMd} onChange={handleChange} rows={3} placeholder="Teclado, foco, aria-label, contraste…" className="code-snippet-textarea" />
              </div>
            </div>
          </section>

          {/* Bloco 3: Variações (Default + outras) */}
          <section className="form-section">
            <h2 className="form-section-title">Variações</h2>
            <p className="form-section-desc">A variação Default é obrigatória e não pode ser removida. Default é obrigatório para publicar.</p>

            {/* Card Default (fixo) */}
            <div className="variation-card variation-card-default">
              <div className="variation-card-header">
                <span className="variation-card-title">Default</span>
                <span className="variation-badge">Default</span>
              </div>
              <div className="form-row">
                <div className="form-field-label">
                  <span className="form-field-name">Código da variação *</span>
                </div>
                <div className="form-field-input">
                  <textarea
                    value={defaultExample.codeSnippet}
                    onChange={(e) => setDefaultExample((d) => ({ ...d, codeSnippet: e.target.value }))}
                    placeholder="HTML/JSX do exemplo"
                    rows={6}
                    className="code-snippet-textarea"
                  />
                  {!defaultExample.codeSnippet?.trim() && <p className="form-helper form-helper-error">Default é obrigatório para publicar.</p>}
                </div>
              </div>
              <details className="form-advanced-details">
                <summary>Avançado (CSS / JS)</summary>
                <div className="form-row">
                  <div className="form-field-label"><span className="form-field-name">CSS</span></div>
                  <div className="form-field-input">
                    <textarea value={defaultExample.codeCss} onChange={(e) => setDefaultExample((d) => ({ ...d, codeCss: e.target.value }))} rows={3} className="code-snippet-textarea" placeholder="Opcional" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field-label"><span className="form-field-name">JS</span></div>
                  <div className="form-field-input">
                    <textarea value={defaultExample.codeJs} onChange={(e) => setDefaultExample((d) => ({ ...d, codeJs: e.target.value }))} rows={3} className="code-snippet-textarea" placeholder="Opcional (não executado no preview no MVP)" />
                  </div>
                </div>
              </details>
            </div>

            <button type="button" className="btn btn-primary btn-sm form-add-variation" onClick={addVariation}>Adicionar variação</button>

            {variations.length > 0 && (
              <ul className="variations-list">
                {variations.map((v, i) => {
                  const key = v.id || `var-${i}`;
                  const collapsed = variationCollapsed[key];
                  return (
                    <li key={key} className="variation-card">
                      <div className="variation-card-header">
                        <button type="button" className="variation-card-toggle" onClick={() => toggleVariationCollapsed(key)} aria-expanded={!collapsed}>
                          {collapsed ? '▶' : '▼'} {v.title || `Variação ${i + 1}`}
                        </button>
                        <div className="variation-card-actions">
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => duplicateVariation(i)}>Duplicar</button>
                          <button type="button" className="btn btn-ghost btn-sm btn-danger-sm" onClick={() => removeVariation(i)}>Remover</button>
                        </div>
                      </div>
                      {!collapsed && (
                        <>
                          <div className="form-row">
                            <div className="form-field-label"><span className="form-field-name">Nome da variação *</span></div>
                            <div className="form-field-input">
                              <input value={v.title} onChange={(e) => updateVariation(i, 'title', e.target.value)} placeholder="Ex.: Small, Icon" />
                            </div>
                          </div>
                          <div className="form-row">
                            <div className="form-field-label"><span className="form-field-name">Slug da variação *</span></div>
                            <div className="form-field-input">
                              <input value={v.slug} onChange={(e) => updateVariation(i, 'slug', e.target.value)} placeholder="ex.: small, icon (kebab-case)" />
                            </div>
                          </div>
                          <div className="form-row">
                            <div className="form-field-label"><span className="form-field-name">Descrição da variação</span></div>
                            <div className="form-field-input">
                              <textarea value={v.description} onChange={(e) => updateVariation(i, 'description', e.target.value)} rows={2} />
                            </div>
                          </div>
                          <div className="form-row">
                            <div className="form-field-label"><span className="form-field-name">Código da variação *</span></div>
                            <div className="form-field-input">
                              <textarea value={v.codeSnippet} onChange={(e) => updateVariation(i, 'codeSnippet', e.target.value)} rows={4} className="code-snippet-textarea" />
                            </div>
                          </div>
                          <details className="form-advanced-details">
                            <summary>Avançado (CSS / JS)</summary>
                            <div className="form-row">
                              <div className="form-field-label"><span className="form-field-name">CSS</span></div>
                              <div className="form-field-input">
                                <textarea value={v.codeCss} onChange={(e) => updateVariation(i, 'codeCss', e.target.value)} rows={2} className="code-snippet-textarea" />
                              </div>
                            </div>
                            <div className="form-row">
                              <div className="form-field-label"><span className="form-field-name">JS</span></div>
                              <div className="form-field-input">
                                <textarea value={v.codeJs} onChange={(e) => updateVariation(i, 'codeJs', e.target.value)} rows={2} className="code-snippet-textarea" />
                              </div>
                            </div>
                          </details>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>

      {publishModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content">
            <h2>Changelog (obrigatório para publicar)</h2>
            <p className="form-field-desc">Descreva o que mudou nesta versão (ex.: Corrigido padding, adicionado estado loading…).</p>
            <textarea
              value={publishChangelog}
              onChange={(e) => setPublishChangelog(e.target.value)}
              rows={4}
              placeholder="Ex.: Corrigido padding, adicionado estado loading…"
              className="code-snippet-textarea"
              style={{ width: '100%', marginTop: 8, marginBottom: 16 }}
            />
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => { setPublishModalOpen(false); setPublishChangelog(''); }}>Cancelar</button>
              <button type="button" className="btn btn-primary" disabled={saving || !publishChangelog.trim()} onClick={handlePublish}>
                {saving ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
