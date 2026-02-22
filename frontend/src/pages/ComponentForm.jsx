import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import CodeEditor from '../components/CodeEditor';
import { IconTrash } from '../components/Icons';
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

const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteSlugConfirm, setDeleteSlugConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    shortDescription: '',
    slug: '',
    tags: [],
    referenceUrl: '',
    importPackage: '',
    importName: '',
    longDescriptionMd: '',
    dependenciesMd: '',
    accessibilityMd: '',
  });
  const [defaultExample, setDefaultExample] = useState({
    id: null,
    description: '',
    codeSnippet: '',
    codeCss: '',
    codeJs: '',
  });
  const [variations, setVariations] = useState([]);
  const [variationCollapsed, setVariationCollapsed] = useState({});
  const [toast, setToast] = useState('');
  const [editChangelogMessage, setEditChangelogMessage] = useState('');
  const [defaultEditorExpanded, setDefaultEditorExpanded] = useState(false);
  const [variationEditorExpanded, setVariationEditorExpanded] = useState({});

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
          importPackage: c.importPackage || '',
          importName: c.importName || '',
          longDescriptionMd: c.longDescriptionMd || c.documentation || '',
          dependenciesMd: c.dependenciesMd || '',
          accessibilityMd: c.accessibilityMd || '',
        });
        const def = c.defaultExample || c.default;
        if (def) {
          setDefaultExample({
            id: def.id,
            description: def.description || '',
            codeSnippet: def.codeSnippet || '',
            codeCss: def.codeCss || '',
            codeJs: def.codeJs || '',
          });
        } else {
          setDefaultExample({ id: null, description: '', codeSnippet: '', codeCss: '', codeJs: '' });
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
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2000);
    return () => clearTimeout(t);
  }, [toast]);

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
      const titleVal = form.title.trim();
      const payload = {
        title: titleVal,
        shortDescription: form.shortDescription.trim(),
        slug: form.slug.trim().toLowerCase(),
        tags: form.tags,
        referenceUrl: form.referenceUrl.trim() || null,
        importPackage: form.importPackage.trim().replace(/\s+/g, '') || null,
        importName: form.importName.trim().replace(/\s+/g, '') || null,
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
      if (isEdit && (!editChangelogMessage || !editChangelogMessage.trim())) {
        setError('Informe o changelog desta alteração (obrigatório ao salvar edição).');
        setSaving(false);
        return;
      }
      let componentId;
      if (isEdit) {
        await api.put(`/components/${id}`, payload);
        componentId = id;
        if (!componentId) {
          setError('Resposta inválida ao atualizar.');
          return;
        }
      } else {
        const { data } = await api.post('/components', payload);
        componentId = data?.id;
        if (componentId == null) {
          setError(data?.error || 'Servidor não retornou o ID do componente. Tente novamente.');
          return;
        }
      }
      await saveDefaultExample(componentId);
      await saveVariations(componentId);
      if (isEdit) {
        try {
          await api.post(`/components/${componentId}/record-changelog`, { message: editChangelogMessage.trim() });
        } catch (err) {
          setError(err.response?.data?.error || 'Erro ao registrar changelog.');
          setSaving(false);
          return;
        }
      }
      window.dispatchEvent(new CustomEvent('components-updated'));
      if (!isEdit) setToast('Componente criado');
      navigate(`/components/${componentId}`, { replace: true });
    } catch (err) {
      let msg = err.response?.data?.error || (err.response?.status === 401 ? 'Faça login para continuar.' : err.response?.status === 403 ? 'Sem permissão para esta ação.' : err.message || 'Erro ao salvar.');
      // No formulário de componente não existe campo "Nome"; o correto é "Título"
      if (msg === 'Nome é obrigatório') msg = 'Título é obrigatório (preencha o campo "Título" nas informações básicas).';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const saveDefaultExample = async (componentId) => {
    const payload = {
      type: 'default',
      title: 'Default',
      slug: 'default',
      description: defaultExample.description || null,
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
        title: v.title || `Variação ${i + 1}`,
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

  const openDeleteModal = () => {
    setDeleteSlugConfirm('');
    setDeleteModalOpen(true);
  };

  const handleDeleteComponent = async () => {
    if (deleteSlugConfirm.trim().toLowerCase() !== form.slug.trim().toLowerCase()) return;
    setError('');
    setDeleting(true);
    try {
      await api.delete(`/components/${id}`);
      setDeleteModalOpen(false);
      setDeleteSlugConfirm('');
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao excluir');
    } finally {
      setDeleting(false);
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

  const duplicateDefaultAsVariation = () => {
    setVariations((v) => [
      ...v,
      {
        id: undefined,
        title: 'Default (cópia)',
        slug: 'default-copia',
        description: defaultExample.description || '',
        order: v.length,
        codeSnippet: defaultExample.codeSnippet || '',
        codeCss: defaultExample.codeCss || '',
        codeJs: defaultExample.codeJs || '',
      },
    ]);
  };

  const duplicateVariation = (index) => {
    if (index === -1) {
      duplicateDefaultAsVariation();
      return;
    }
    const src = variations[index];
    setVariations((v) => [
      ...v.slice(0, index + 1),
      { ...src, id: undefined, title: (src.title || '') + ' (cópia)', slug: ((src.slug || '').replace(/-copia\d*$/, '') || 'var') + '-copia', order: index + 1 },
      ...v.slice(index + 1).map((x, i) => ({ ...x, order: index + 2 + i })),
    ]);
  };

  const removeVariation = (index) => {
    const v = variations[index];
    if (!window.confirm(`Excluir a variação "${v?.title || 'Variação ' + (index + 1)}"?`)) return;
    setVariations((prev) => prev.filter((_, i) => i !== index).map((x, i) => ({ ...x, order: i })));
  };

  const moveVariationUp = (index) => {
    if (index <= 0) return;
    setVariations((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next.map((x, i) => ({ ...x, order: i }));
    });
  };

  const moveVariationDown = (index) => {
    if (index >= variations.length - 1) return;
    setVariations((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next.map((x, i) => ({ ...x, order: i }));
    });
  };

  const toggleVariationCollapsed = (key) => {
    setVariationCollapsed((c) => ({ ...c, [key]: !c[key] }));
  };

  const cancelUrl = isEdit ? `/components/${id}` : '/components';

  return (
    <div className="page page-component-form">
      <div className="component-form">
        <header className="component-form-header">
          <h1 className="page-title">{isEdit ? 'Editar componente' : 'Novo componente'}</h1>
          <div className="component-form-actions component-form-actions-text">
            <button type="button" onClick={() => navigate(cancelUrl)} className="btn btn-ghost">Cancelar</button>
            {isEdit && (
              <button type="button" className="btn btn-ghost btn-ghost-danger" onClick={openDeleteModal} disabled={loading}><IconTrash /> Excluir componente</button>
            )}
            <button type="button" className="btn btn-ghost" onClick={saveDraft} disabled={saving || loading}>{saving ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </header>
        {error && <div className="page-error" role="alert">{error === 'Nome é obrigatório' ? 'Título é obrigatório (preencha o campo "Título" nas informações básicas).' : error}</div>}
        {loading ? (
          <div className="component-form-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
            <p className="page-loading" style={{ margin: 0 }}>Carregando componente...</p>
          </div>
        ) : (
        <div className="component-form-body">
          {/* Seção A — Informações básicas */}
          <section className="form-section" aria-labelledby="section-a">
            <h2 id="section-a" className="form-section-title">Informações básicas</h2>
            <p className="form-section-desc">Dados essenciais do componente.</p>

            <div className="form-field-block">
              <label className="form-field-name" htmlFor="form-title">Título *</label>
              <input id="form-title" name="title" value={form.title} onChange={handleChange} required placeholder="Ex.: Botão" minLength={2} aria-describedby="form-title-helper" />
              <p id="form-title-helper" className="form-helper">Nome principal do componente no catálogo e na documentação.</p>
              {form.title.length > 0 && form.title.length < 2 && <p className="form-helper form-helper-error">Mínimo 2 caracteres.</p>}
            </div>

            <div className="form-field-block">
              <label className="form-field-name" htmlFor="form-slug">Slug *</label>
              <div className="form-field-slug">
                <input id="form-slug" name="slug" value={form.slug} onChange={handleChange} required placeholder="ex.: botao" aria-describedby="form-slug-helper" />
                <button type="button" className="form-link" onClick={suggestSlug}>Gerar do título</button>
              </div>
              <p id="form-slug-helper" className="form-helper">Identificador único (sem acentos) usado na URL e no sistema. Use letras minúsculas e hífen.</p>
              {form.slug && (
                <p className={`form-helper ${slugCheck && !slugCheck.available ? 'form-helper-error' : 'form-helper-slug'}`}>
                  {slugCheck === null ? 'Verificando...' : slugCheck.available ? 'Slug disponível' : (slugCheck.error || 'Slug já existe')}
                </p>
              )}
            </div>

            <div className="form-field-block">
              <label className="form-field-name" htmlFor="form-shortDescription">Descrição curta *</label>
              <textarea id="form-shortDescription" name="shortDescription" value={form.shortDescription} onChange={handleChange} rows={3} placeholder="Resumo em 1–2 frases sobre quando usar este componente." minLength={10} aria-describedby="form-shortDescription-helper" />
              <p id="form-shortDescription-helper" className="form-helper">Aparece no card/lista do componente e no topo da documentação.</p>
              {form.shortDescription.length > 0 && form.shortDescription.length < 10 && <p className="form-helper form-helper-error">Mínimo 10 caracteres.</p>}
            </div>

            <div className="form-field-block">
              <label className="form-field-name">Tags *</label>
              <ChipsInput values={form.tags} onChange={(tags) => setForm((f) => ({ ...f, tags }))} placeholder="Digite e pressione Enter (ex.: formulário, navegação, feedback)" />
              <p className="form-helper">Use tags para facilitar a busca e a organização. Recomendado: 2–5 tags.</p>
              {form.tags.length === 0 && (error && error.includes('tag') ? <p className="form-helper form-helper-error">Adicione ao menos uma tag.</p> : null)}
            </div>

            <div className="form-field-block">
              <label className="form-field-name" htmlFor="form-referenceUrl">Link de referência <span className="form-field-optional">(opcional)</span></label>
              <input id="form-referenceUrl" name="referenceUrl" value={form.referenceUrl} onChange={handleChange} type="url" placeholder="https://…" aria-describedby="form-referenceUrl-helper" />
              <p id="form-referenceUrl-helper" className="form-helper">Link para referência externa (Figma, docs, issue, benchmark ou implementação existente).</p>
            </div>
          </section>

          {/* Seção B — Como importar */}
          <section className="form-section" aria-labelledby="section-b">
            <h2 id="section-b" className="form-section-title">Como importar</h2>
            <p className="form-section-desc">Informações de importação (opcional).</p>

            <div className="form-field-block">
              <label className="form-field-name" htmlFor="form-importPackage">Pacote (import)</label>
              <input id="form-importPackage" value={form.importPackage} onChange={(e) => setForm((f) => ({ ...f, importPackage: e.target.value }))} placeholder="@belier/ui" aria-describedby="form-importPackage-helper" />
              <p id="form-importPackage-helper" className="form-helper">Caminho do pacote usado para importar este componente quando houver biblioteca instalada.</p>
            </div>

            <div className="form-field-block">
              <label className="form-field-name" htmlFor="form-importName">Nome exportado</label>
              <input id="form-importName" value={form.importName} onChange={(e) => setForm((f) => ({ ...f, importName: e.target.value }))} placeholder="Button" aria-describedby="form-importName-helper" />
              <p id="form-importName-helper" className="form-helper">Nome do export do componente. Ex.: Button, Input, Card.</p>
            </div>

            <div className="form-snippet-block">
              <span className="form-snippet-title">Snippet de importação</span>
              {form.importPackage.trim() && form.importName.trim() ? (
                <div className="form-snippet-code-wrap">
                  <pre className="form-snippet-code">{`import { ${form.importName.trim()} } from "${form.importPackage.trim()}";`}</pre>
                  <button type="button" className="form-link" onClick={() => { navigator.clipboard.writeText(`import { ${form.importName.trim()} } from "${form.importPackage.trim()}";`); setToast('Copiado'); }}>Copiar</button>
                </div>
              ) : (
                <p className="form-helper">Preencha Pacote e Nome exportado para gerar o snippet de importação.</p>
              )}
            </div>
          </section>

          {/* Seção C — Documentação (Markdown) */}
          <section className="form-section" aria-labelledby="section-c">
            <h2 id="section-c" className="form-section-title">Documentação</h2>
            <p className="form-section-desc">Conteúdo em Markdown (opcional).</p>

            <div className="form-field-block">
              <label className="form-field-name" htmlFor="form-longDescriptionMd">Descrição longa (Docs)</label>
              <textarea id="form-longDescriptionMd" name="longDescriptionMd" value={form.longDescriptionMd} onChange={handleChange} rows={6} placeholder={`Quando usar\n- …\n\nQuando não usar\n- …`} className="form-textarea-lg code-snippet-textarea" aria-describedby="form-longDescriptionMd-helper" />
              <p id="form-longDescriptionMd-helper" className="form-helper">Texto principal da documentação. Descreva quando usar, quando evitar e regras importantes.</p>
            </div>

            <div className="form-field-block">
              <label className="form-field-name" htmlFor="form-dependenciesMd">Dependências</label>
              <textarea id="form-dependenciesMd" name="dependenciesMd" value={form.dependenciesMd} onChange={handleChange} rows={3} placeholder="Ex.: Usa tokens do tema, classes utilitárias, lista de itens, ícones…" className="code-snippet-textarea" aria-describedby="form-dependenciesMd-helper" />
              <p id="form-dependenciesMd-helper" className="form-helper">Pré-requisitos para usar o componente (tokens, classes, dados, bibliotecas).</p>
            </div>

            <div className="form-field-block">
              <label className="form-field-name" htmlFor="form-accessibilityMd">Acessibilidade</label>
              <textarea id="form-accessibilityMd" name="accessibilityMd" value={form.accessibilityMd} onChange={handleChange} rows={3} placeholder={`- Foco visível\n- Navegação por teclado\n- aria-label quando necessário`} className="code-snippet-textarea" aria-describedby="form-accessibilityMd-helper" />
              <p id="form-accessibilityMd-helper" className="form-helper">Regras mínimas de acessibilidade e comportamento esperado.</p>
            </div>
          </section>

          {isEdit && (
            <section className="form-section">
              <h2 className="form-section-title">Changelog desta alteração</h2>
              <p className="form-section-desc">Obrigatório ao salvar edição. Descreva brevemente o que foi alterado (ex.: ajuste de padding, atualização de docs).</p>
              <div className="form-row">
                <div className="form-field-label">
                  <span className="form-field-name">Mensagem de changelog *</span>
                </div>
                <div className="form-field-input">
                  <textarea
                    value={editChangelogMessage}
                    onChange={(e) => setEditChangelogMessage(e.target.value)}
                    rows={3}
                    placeholder="Ex.: Ajustado padding e hover na variação Small"
                    className="code-snippet-textarea"
                    required
                  />
                </div>
              </div>
            </section>
          )}

          {/* Seção D — Variações */}
          <section className="form-section form-section-variations" aria-labelledby="section-d">
            <div className="variations-section-header">
              <div>
                <h2 id="section-d" className="form-section-title">Variações</h2>
                <p className="form-section-desc">Crie subcomponentes/variações como Default, Small, Com ícone e Loading. Cada variação tem seu próprio preview, código, comentários e changelog.</p>
              </div>
              <button type="button" className="btn btn-ghost btn-sm variations-add-btn" onClick={addVariation}>+ Adicionar variação</button>
            </div>

            <div className="variations-content">
              {/* Card Default (fixo) */}
              <div className="variation-card variation-card-default">
                <div className="variation-card-header">
                  <span className="variation-card-title">Default</span>
                  <span className="variation-badge">Default</span>
                  <div className="variation-card-actions">
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => duplicateVariation(-1)}>Duplicar</button>
                    <button type="button" className="btn btn-ghost btn-sm variation-remove-disabled" disabled aria-label="Default não pode ser removida">Remover</button>
                  </div>
                </div>
                <div className="variation-card-fields">
                  <div className="variation-field">
                    <label className="variation-field-label">Nome da variação *</label>
                    <input value="Default" readOnly disabled aria-describedby="default-name-helper" />
                    <p id="default-name-helper" className="form-helper">Nome exibido na documentação e nos seletores.</p>
                  </div>
                  <div className="variation-field">
                    <label className="variation-field-label">Slug da variação *</label>
                    <input value="default" readOnly disabled aria-describedby="default-slug-helper" />
                    <p id="default-slug-helper" className="form-helper">Identificador da variação dentro do componente. Use kebab-case.</p>
                  </div>
                  <div className="variation-field">
                    <label className="variation-field-label">Descrição</label>
                    <textarea value={defaultExample.description} onChange={(e) => setDefaultExample((d) => ({ ...d, description: e.target.value }))} rows={2} placeholder="Descreva as características únicas" aria-describedby="default-desc-helper" />
                    <p id="default-desc-helper" className="form-helper">O que diferencia esta variação?</p>
                  </div>
                  <div className="variation-field">
                    <label className="variation-field-label">Código *</label>
                    <CodeEditor
                      value={defaultExample.codeSnippet}
                      onChange={(val) => setDefaultExample((d) => ({ ...d, codeSnippet: val }))}
                      onCopy={() => setToast('Copiado')}
                      expanded={defaultEditorExpanded}
                      onToggleExpand={() => setDefaultEditorExpanded((e) => !e)}
                      placeholder="HTML/JSX do exemplo"
                    />
                    <p className="form-helper">Exemplo de uso desta variação. Este código será exibido na documentação e usado no preview.</p>
                    {!defaultExample.codeSnippet?.trim() && <p className="form-helper form-helper-error">Código obrigatório para publicar.</p>}
                  </div>
                </div>
                <details className="form-advanced-details">
                  <summary>Avançado</summary>
                  <div className="variation-field">
                    <label className="variation-field-label">CSS (opcional)</label>
                    <textarea value={defaultExample.codeCss} onChange={(e) => setDefaultExample((d) => ({ ...d, codeCss: e.target.value }))} rows={3} className="code-snippet-textarea" placeholder="Estilos adicionais" />
                    <p className="form-helper">Estilos adicionais para esta variação.</p>
                  </div>
                  <div className="variation-field">
                    <label className="variation-field-label">JavaScript (opcional)</label>
                    <textarea value={defaultExample.codeJs} onChange={(e) => setDefaultExample((d) => ({ ...d, codeJs: e.target.value }))} rows={3} className="code-snippet-textarea" placeholder="Scripts adicionais" />
                    <p className="form-helper">Scripts adicionais para esta variação (apenas para armazenamento).</p>
                  </div>
                </details>
              </div>

              {variations.map((v, i) => {
                const key = v.id || `var-${i}`;
                const collapsed = variationCollapsed[key];
                const expanded = variationEditorExpanded[key];
                return (
                  <div key={key} className="variation-card">
                    <div className="variation-card-header">
                      <span className="variation-card-title">{v.title?.trim() || `Variação ${i + 1}`}</span>
                      <div className="variation-card-actions">
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => duplicateVariation(i)}>Duplicar</button>
                        <button type="button" className="btn btn-ghost btn-sm btn-danger-sm" onClick={() => removeVariation(i)}>Remover</button>
                      </div>
                    </div>
                    {!collapsed && (
                      <>
                        <div className="variation-card-fields">
                          <div className="variation-field">
                            <label className="variation-field-label">Nome da variação *</label>
                            <input value={v.title} onChange={(e) => updateVariation(i, 'title', e.target.value)} placeholder="Ex.: Small" />
                            <p className="form-helper">Nome exibido na documentação e nos seletores.</p>
                          </div>
                          <div className="variation-field">
                            <label className="variation-field-label">Slug da variação *</label>
                            <input value={v.slug} onChange={(e) => updateVariation(i, 'slug', e.target.value)} placeholder="ex.: small" />
                            <p className="form-helper">Identificador da variação dentro do componente. Use kebab-case.</p>
                          </div>
                          <div className="variation-field">
                            <label className="variation-field-label">Descrição</label>
                            <textarea value={v.description} onChange={(e) => updateVariation(i, 'description', e.target.value)} rows={2} placeholder="Descreva as características únicas" />
                            <p className="form-helper">O que diferencia esta variação?</p>
                          </div>
                          <div className="variation-field">
                            <label className="variation-field-label">Código *</label>
                            <CodeEditor
                              value={v.codeSnippet}
                              onChange={(val) => updateVariation(i, 'codeSnippet', val)}
                              onCopy={() => setToast('Copiado')}
                              expanded={expanded}
                              onToggleExpand={() => setVariationEditorExpanded((prev) => ({ ...prev, [key]: !prev[key] }))}
                              placeholder="HTML/JSX"
                            />
                            <p className="form-helper">Exemplo de uso desta variação. Este código será exibido na documentação e usado no preview.</p>
                          </div>
                        </div>
                        <details className="form-advanced-details">
                          <summary>Avançado</summary>
                          <div className="variation-field">
                            <label className="variation-field-label">CSS (opcional)</label>
                            <textarea value={v.codeCss} onChange={(e) => updateVariation(i, 'codeCss', e.target.value)} rows={2} className="code-snippet-textarea" placeholder="Estilos adicionais" />
                            <p className="form-helper">Estilos adicionais para esta variação.</p>
                          </div>
                          <div className="variation-field">
                            <label className="variation-field-label">JavaScript (opcional)</label>
                            <textarea value={v.codeJs} onChange={(e) => updateVariation(i, 'codeJs', e.target.value)} rows={2} className="code-snippet-textarea" placeholder="Scripts (armazenamento)" />
                            <p className="form-helper">Scripts adicionais para esta variação (apenas para armazenamento).</p>
                          </div>
                        </details>
                      </>
                    )}
                    <button type="button" className="variation-card-toggle" onClick={() => toggleVariationCollapsed(key)} aria-expanded={!collapsed}>
                      {collapsed ? '▶ Expandir' : '▼ Recolher'}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {toast && <div className="form-toast" role="status">{toast}</div>}
        </div>
        )}
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

      {deleteModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
          <div className="modal-content modal-content-destructive">
            <h2 id="delete-modal-title">Excluir componente</h2>
            <p className="form-field-desc">Esta ação é irreversível. Para confirmar, digite o slug do componente: <strong>{form.slug}</strong></p>
            <input
              type="text"
              className="form-field-input form-delete-slug-input"
              value={deleteSlugConfirm}
              onChange={(e) => setDeleteSlugConfirm(e.target.value)}
              placeholder="Digite o slug"
              autoComplete="off"
              style={{ marginTop: 8, marginBottom: 16 }}
            />
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => { setDeleteModalOpen(false); setDeleteSlugConfirm(''); }}>Cancelar</button>
              <button
                type="button"
                className="btn btn-danger-solid"
                disabled={deleting || deleteSlugConfirm.trim().toLowerCase() !== form.slug.trim().toLowerCase()}
                onClick={handleDeleteComponent}
              >
                {deleting ? 'Excluindo...' : 'Excluir componente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
