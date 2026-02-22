import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { IconEdit, IconTrash } from '../components/Icons';
import './ComponentDetail.css';

/** Destaque de sintaxe simples para HTML/CSS: retorna array de elementos React. */
function highlightCode(str) {
  if (!str) return null;
  const out = [];
  let key = 0;
  const push = (cls, text) => {
    if (text == null || text === '') return;
    out.push(<span key={key++} className={cls}>{text}</span>);
  };
  let i = 0;
  const s = str;
  while (i < s.length) {
    if (s[i] === '<') {
      i++;
      push('code-punctuation', '<');
      if (s[i] === '/') { push('code-punctuation', '/'); i++; }
      let name = '';
      while (i < s.length && /[a-zA-Z0-9-]/.test(s[i])) name += s[i++];
      push('code-tag', name);
      while (i < s.length && s[i] !== '>' && s[i] !== '/') {
        while (i < s.length && /\s/.test(s[i])) { push('code-plain', s[i]); i++; }
        if (i >= s.length || s[i] === '>' || s[i] === '/') break;
        let attr = '';
        while (i < s.length && /[a-zA-Z0-9-]/.test(s[i])) attr += s[i++];
        if (attr) push('code-attr', attr);
        if (s[i] === '=') { push('code-punctuation', '='); i++; }
        if (s[i] === '"' || s[i] === "'") {
          const q = s[i++];
          push('code-punctuation', q);
          let val = '';
          while (i < s.length && s[i] !== q) val += s[i++];
          push('code-string', val);
          if (s[i] === q) { push('code-punctuation', s[i]); i++; }
        }
      }
      if (s[i] === '/') { push('code-punctuation', '/'); i++; }
      if (s[i] === '>') { push('code-punctuation', '>'); i++; }
      continue;
    }
    let plain = '';
    while (i < s.length && s[i] !== '<') plain += s[i++];
    if (plain) push('code-plain', plain);
  }
  return out;
}

function normalizeVariations(variations) {
  if (!variations) return [];
  if (Array.isArray(variations)) return variations;
  const entries = Object.entries(variations || {});
  return entries.map(([key, val]) => {
    if (val && typeof val === 'object') {
      return {
        id: val.id ?? key,
        title: val.title,
        description: val.description,
        codeSnippet: val.codeSnippet ?? val.code ?? '',
        ...val,
      };
    }
    return {
      id: key,
      title: key,
      description: '',
      codeSnippet: String(val ?? ''),
    };
  });
}

/** Converte Markdown básico em HTML seguro (parágrafos, quebras, **negrito**, ## título). */
function simpleMarkdown(md) {
  if (!md || typeof md !== 'string') return '';
  let s = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  s = s.replace(/^### (.+)$/gm, '<h4>$1</h4>');
  s = s.replace(/^## (.+)$/gm, '<h3>$1</h3>');
  s = s.replace(/^# (.+)$/gm, '<h2>$1</h2>');
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
  s = s.replace(/\n\n/g, '</p><p>');
  s = s.replace(/\n/g, '<br/>');
  return `<p>${s}</p>`;
}

export default function ComponentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [component, setComponent] = useState(null);
  const [versions, setVersions] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [activeIndexId, setActiveIndexId] = useState('title');

  const canEdit = ['admin', 'designer'].includes(user?.profile);
  const canDelete = user?.profile === 'admin';
  const statusLabel = { draft: 'Rascunho', published: 'Publicado', archived: 'Arquivado' };
  const [savingVersion, setSavingVersion] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmSlug, setDeleteConfirmSlug] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [moreActionsOpen, setMoreActionsOpen] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  const [mainTab, setMainTab] = useState('preview');
  const moreActionsRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onOutside = (e) => {
      if (moreActionsRef.current && !moreActionsRef.current.contains(e.target)) setMoreActionsOpen(false);
    };
    if (moreActionsOpen) {
      document.addEventListener('click', onOutside);
      return () => document.removeEventListener('click', onOutside);
    }
  }, [moreActionsOpen]);

  const totalComments = comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);

  const canArchive = canEdit;

  const handleDeleteComponent = async () => {
    if (!id || !component || deleteConfirmSlug !== (component.slug || '')) return;
    setIsDeleting(true);
    try {
      await api.delete(`/components/${id}`);
      setDeleteModalOpen(false);
      setDeleteConfirmSlug('');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Não foi possível excluir o componente.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleArchive = async () => {
    try {
      await api.post(`/components/${id}/archive`);
      setComponent((c) => (c ? { ...c, status: 'archived' } : null));
      setMoreActionsOpen(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao arquivar');
    }
  };

  useEffect(() => {
    if (!id) return;
    setError('');
    setComponent(null);
    setLoading(true);
    let cancelled = false;
    const done = () => { if (!cancelled) setLoading(false); };
    const apply = (data) => {
      if (cancelled) return;
      const obj = data && typeof data === 'object' ? (data.component ?? data) : null;
      if (obj && (obj.id != null || obj.name != null || obj.title != null)) {
        setComponent(Array.isArray(obj) ? obj[0] : obj);
      } else {
        setError((obj && obj.error) || (data && data.error) || 'Resposta inválida do servidor.');
      }
    };
    const url = `/components/${id}`;
    api.get(url, { params: { include: 'examples' } })
      .then((res) => {
        const body = res?.data;
        apply(body);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.response?.status === 401) return;
        api.get(url)
          .then((res) => apply(res?.data))
          .catch((retryErr) => {
            if (cancelled) return;
            if (retryErr.response?.status === 404) {
              setComponent(null);
              setError('');
              return;
            }
            setError(retryErr.response?.data?.error || retryErr.message || 'Não foi possível carregar o componente. Verifique a conexão.');
          })
          .finally(done);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const [selectedExampleId, setSelectedExampleId] = useState(null);

  useEffect(() => {
    if (!id) return;
    api.get(`/versions/component/${id}`)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setVersions(list);
        if (list.length > 0) setSelectedVersionId(list[0].id);
        else setSelectedVersionId(null);
      })
      .catch(() => setVersions([]));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const params = {};
    if (selectedVersionId != null) params.versionId = selectedVersionId;
    if (effectiveExampleIdForApi != null && typeof effectiveExampleIdForApi === 'number') params.exampleId = effectiveExampleIdForApi;
    else if (selectedExampleId != null && typeof selectedExampleId === 'number') params.exampleId = selectedExampleId;
    const q = new URLSearchParams(params).toString();
    api.get(`/comments/component/${id}${q ? `?${q}` : ''}`).then((res) => setComments(res.data || [])).catch(() => setComments([]));
  }, [id, selectedVersionId, selectedExampleId, effectiveExampleIdForApi]);


  const versionsList = Array.isArray(versions) ? versions : [];
  const selectedVersion = selectedVersionId != null ? versionsList.find((v) => v.id === selectedVersionId) : null;
  const fromSnapshot = selectedVersion?.content?.variationsSnapshot;
  const compDefault = component?.defaultExample;
  const compVars = normalizeVariations(component?.variations) || [];
  const allExamples = fromSnapshot && Array.isArray(fromSnapshot) && fromSnapshot.length > 0
    ? fromSnapshot.map((s, i) => {
        const id = s.id ?? `snap-${selectedVersion.id}-${i}`;
        const effectiveExampleId = s.id != null ? s.id : (i === 0 ? compDefault?.id : compVars[i - 1]?.id);
        return {
          id,
          effectiveExampleId,
          title: i === 0 ? 'Default' : (s.title || `Variação ${i}`),
          slug: s.slug || (i === 0 ? 'default' : `v${i}`),
          codeSnippet: s.codeSnippet ?? '',
          codeCss: s.codeCss,
          codeJs: s.codeJs,
          description: s.description,
        };
      })
    : [
        ...(compDefault ? [{ ...compDefault, title: 'Default', slug: 'default', effectiveExampleId: compDefault.id }] : []),
        ...compVars.map((v) => ({ ...v, effectiveExampleId: v.id })),
      ];
  const currentExample = selectedExampleId != null
    ? allExamples.find((e) => e.id === selectedExampleId || e.id === Number(selectedExampleId))
    : allExamples[0];
  const currentCode = currentExample?.codeSnippet ?? '';
  const effectiveExampleIdForApi = currentExample?.effectiveExampleId ?? currentExample?.id ?? selectedExampleId;

  const loadComments = () => {
    const params = {};
    if (selectedVersionId != null) params.versionId = selectedVersionId;
    const eid = effectiveExampleIdForApi != null && typeof effectiveExampleIdForApi === 'number' ? effectiveExampleIdForApi : selectedExampleId;
    if (eid != null && typeof eid === 'number') params.exampleId = eid;
    const q = new URLSearchParams(params).toString();
    return api.get(`/comments/component/${id}${q ? `?${q}` : ''}`).then((res) => setComments(res.data || [])).catch(() => setComments([]));
  };

  useEffect(() => {
    if (!component) return;
    if (allExamples.length > 0 && (selectedExampleId == null || !allExamples.some((e) => e.id === selectedExampleId || e.id === Number(selectedExampleId)))) {
      setSelectedExampleId(allExamples[0]?.id ?? null);
    }
  }, [component?.id, selectedVersionId, allExamples.length]);

  useEffect(() => {
    const ids = ['title', 'preview-code-comments', 'documentation', 'versions'];
    const obs = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) setActiveIndexId(visible[0].target.id);
    }, { root: null, rootMargin: '0px 0px -60% 0px', threshold: [0.25, 0.5, 0.75] });
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [component]);

  const handleSaveVersion = async () => {
    setSavingVersion(true);
    try {
      const { data } = await api.post(`/versions/component/${id}`, { description: `Versão ${versionsList.length + 1}` });
      setVersions((prev) => [data, ...prev]);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao registrar versão');
    } finally {
      setSavingVersion(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSendingComment(true);
    try {
      const exampleIdForApi = currentExample?.effectiveExampleId ?? currentExample?.id ?? selectedExampleId;
      await api.post(`/comments/component/${id}`, {
        text: commentText.trim(),
        exampleId: typeof exampleIdForApi === 'number' ? exampleIdForApi : undefined,
        versionId: selectedVersionId ?? undefined,
      });
      loadComments();
      setCommentText('');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao enviar comentário');
    } finally {
      setSendingComment(false);
    }
  };

  const handleReply = async (e, parentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSendingComment(true);
    try {
      const exampleIdForApi = currentExample?.effectiveExampleId ?? currentExample?.id ?? selectedExampleId;
      await api.post(`/comments/component/${id}`, {
        text: replyText.trim(),
        parentId,
        exampleId: typeof exampleIdForApi === 'number' ? exampleIdForApi : undefined,
        versionId: selectedVersionId ?? undefined,
      });
      loadComments();
      setReplyText('');
      setReplyingTo(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao enviar resposta');
    } finally {
      setSendingComment(false);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editingText.trim()) return;
    try {
      await api.put(`/comments/${commentId}`, { text: editingText.trim() });
      loadComments();
      setEditingId(null);
      setEditingText('');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao editar');
    }
  };

  if (loading) return <div className="page-loading">Carregando...</div>;
  if (error && !component) return <div className="page-error">{error}</div>;
  if (!component) {
    return (
      <div className="page">
        <p className="page-loading">Componente não encontrado.</p>
        <Link to="/components" className="btn btn-ghost">← Voltar à lista</Link>
      </div>
    );
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentCode || '').then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 1500);
    });
  };

  return (
    <div className="page detail-content-grid">
      <div className="detail-content">
        <div className="page-header" id="title">
          <div className="page-header-row">
            <div className="page-header-left">
              <h1>{component.title || component.name}</h1>
              <span className={`detail-badge detail-badge-${component.status || 'draft'}`}>
                {statusLabel[component.status] || component.status || 'Rascunho'}
              </span>
            </div>
            <div className="page-header-actions">
              {canEdit && (
                <Link to={`/components/${id}/edit`} className="btn-edit-header">
                  <IconEdit /> Editar
                </Link>
              )}
              <button type="button" className="btn-edit-header" onClick={handleCopyCode}>
                {copyFeedback ? 'Copiado!' : 'Copiar código'}
              </button>
              <a href={`/api/components/${id}/zip`} className="btn-edit-header" download target="_blank" rel="noopener noreferrer">
                Baixar ZIP
              </a>
              <div className="detail-more-actions-wrap" ref={moreActionsRef}>
                <button
                  type="button"
                  className="btn-icon-more"
                  onClick={() => setMoreActionsOpen((o) => !o)}
                  aria-expanded={moreActionsOpen}
                  aria-haspopup="true"
                  aria-label="Mais ações"
                >
                  ⋯
                </button>
                {moreActionsOpen && (
                  <div className="detail-more-actions-menu">
                    {canArchive && (
                      <button type="button" className="detail-more-action-item" onClick={handleArchive}>
                        Arquivar componente
                      </button>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        className="detail-more-action-item detail-more-action-danger"
                        onClick={() => { setMoreActionsOpen(false); setDeleteModalOpen(true); setDeleteConfirmSlug(''); }}
                      >
                        Excluir componente
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          {Array.isArray(component.tags) && component.tags.length > 0 && (
            <div className="detail-tags-wrap">
              {component.tags.map((tag, i) => (
                <span key={i} className="detail-tag-chip">{tag}</span>
              ))}
            </div>
          )}
          {component.responsible && (
            <span className="detail-meta">Responsável: {component.responsible.name}</span>
          )}
          {component.updatedAt && (
            <span className="detail-meta">Última atualização: {new Date(component.updatedAt).toLocaleString('pt-BR')}</span>
          )}
          {(component.shortDescription || component.description) && (
            <p className="detail-description">{component.shortDescription || component.description}</p>
          )}
        </div>

        <section className="detail-card detail-card-main" id="preview-code-comments">
          <div className="detail-selectors">
            <label className="detail-selector-label">
              Versão:
              <select
                className="detail-select"
                value={selectedVersionId ?? ''}
                onChange={(e) => setSelectedVersionId(e.target.value ? Number(e.target.value) : null)}
              >
                {(versionsList.length === 0) && <option value="">—</option>}
                {versionsList.map((v) => (
                  <option key={v.id} value={v.id}>v{v.number}{v.isPublished ? ' (publicada)' : ''}</option>
                ))}
              </select>
            </label>
            <label className="detail-selector-label">
              Variação:
              <select
                className="detail-select"
                value={currentExample ? (selectedExampleId ?? currentExample.id) : ''}
                onChange={(e) => setSelectedExampleId(e.target.value ? (allExamples.find((ex) => String(ex.id) === e.target.value)?.id ?? e.target.value) : null)}
              >
                {allExamples.length === 0 && <option value="">—</option>}
                {allExamples.map((ex) => (
                  <option key={ex.id} value={ex.id}>{ex.title === 'Default' ? 'Default' : (ex.title || ex.slug || ex.id)}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="usage-tabs section-tabs">
            <button type="button" className={`usage-tab section-tab ${mainTab === 'preview' ? 'active' : ''}`} onClick={() => setMainTab('preview')}>Preview</button>
            <button type="button" className={`usage-tab section-tab ${mainTab === 'code' ? 'active' : ''}`} onClick={() => setMainTab('code')}>Código</button>
            <button type="button" className={`usage-tab section-tab ${mainTab === 'comments' ? 'active' : ''}`} onClick={() => setMainTab('comments')}>Comentários ({totalComments})</button>
          </div>
          {mainTab === 'code' && (
            <div className="code-block-wrap">
              <button type="button" className="code-block-copy" onClick={handleCopyCode} title="Copiar" aria-label="Copiar código">
                {copyFeedback ? <span className="code-copy-feedback">Copiado!</span> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>}
              </button>
              <div className="code-block-with-lines">
                <div className="code-line-numbers" aria-hidden="true">
                  {(currentCode || '// Nenhum código definido.').split('\n').map((_, i) => <span key={i} className="code-ln">{i + 1}</span>)}
                </div>
                <pre className="code-block">
                  {(currentCode || '// Nenhum código definido.').split('\n').map((line, i) => (
                    <div key={i} className="code-line"><code>{highlightCode(line)}</code></div>
                  ))}
                </pre>
              </div>
            </div>
          )}
          {mainTab === 'preview' && (
            <div className="usage-preview-wrap">
              {currentCode && currentCode.trim() ? (
                <iframe title="Pré-visualização" className="usage-preview-iframe" srcDoc={currentCode} sandbox="allow-same-origin" />
              ) : (
                <p className="detail-empty">Nenhum código de uso definido.</p>
              )}
            </div>
          )}
          {mainTab === 'comments' && (
            <div className="detail-comments-tab">
              {comments.length === 0 ? (
                <p className="detail-empty">Sem comentários para esta variação nesta versão.</p>
              ) : (
                <ul className="comment-list">
                  {comments.map((c) => (
                    <li key={c.id} className="comment-item">
                      <span className="comment-author">{c.User?.name || 'Usuário'}</span>
                      <span className="comment-date">{new Date(c.createdAt).toLocaleString('pt-BR')}</span>
                      {editingId === c.id ? (
                        <div className="comment-edit-box">
                          <textarea value={editingText} onChange={(e) => setEditingText(e.target.value)} rows={2} className="comment-textarea" />
                          <div className="comment-actions">
                            <button type="button" className="btn btn-primary" onClick={() => handleEditComment(c.id)}>Salvar</button>
                            <button type="button" className="btn btn-ghost" onClick={() => { setEditingId(null); setEditingText(''); }}>Cancelar</button>
                          </div>
                        </div>
                      ) : (
                        <p className="comment-text">{c.text}</p>
                      )}
                      {user && editingId !== c.id && (
                        <div className="comment-actions">
                          {user.id === c.User?.id && (
                            <button type="button" className="btn btn-ghost" onClick={() => { setEditingId(c.id); setEditingText(c.text); }}>Editar</button>
                          )}
                          <button type="button" className="btn btn-ghost" onClick={() => { setReplyingTo(replyingTo === c.id ? null : c.id); setReplyText(''); }}>Responder</button>
                        </div>
                      )}
                      {replyingTo === c.id && (
                        <form onSubmit={(e) => handleReply(e, c.id)} className="comment-reply-form">
                          <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Escreva uma resposta..." rows={2} className="comment-textarea" />
                          <div className="comment-actions">
                            <button type="submit" className="btn btn-primary" disabled={sendingComment || !replyText.trim()}>Enviar</button>
                            <button type="button" className="btn btn-ghost" onClick={() => { setReplyingTo(null); setReplyText(''); }}>Cancelar</button>
                          </div>
                        </form>
                      )}
                      {c.replies && c.replies.length > 0 && (
                        <ul className="comment-replies">
                          {[...c.replies].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).map((r) => (
                            <li key={r.id} className="comment-item comment-reply">
                              <span className="comment-author">{r.User?.name || 'Usuário'}</span>
                              <span className="comment-date">{new Date(r.createdAt).toLocaleString('pt-BR')}</span>
                              {editingId === r.id ? (
                                <div className="comment-edit-box">
                                  <textarea value={editingText} onChange={(e) => setEditingText(e.target.value)} rows={2} className="comment-textarea" />
                                  <div className="comment-actions">
                                    <button type="button" className="btn btn-primary" onClick={() => handleEditComment(r.id)}>Salvar</button>
                                    <button type="button" className="btn btn-ghost" onClick={() => { setEditingId(null); setEditingText(''); }}>Cancelar</button>
                                  </div>
                                </div>
                              ) : (
                                <p className="comment-text">{r.text}</p>
                              )}
                              {user && user.id === r.User?.id && editingId !== r.id && (
                                <button type="button" className="btn btn-ghost" onClick={() => { setEditingId(r.id); setEditingText(r.text); }}>Editar</button>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {user ? (
                <form onSubmit={handleSubmitComment} className="comment-form">
                  <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Adicionar comentário..." rows={3} className="comment-textarea" />
                  <button type="submit" className="btn btn-primary" disabled={sendingComment || !commentText.trim()}>
                    {sendingComment ? 'Enviando...' : 'Comentar'}
                  </button>
                </form>
              ) : (
                <p className="comment-login-hint"><Link to="/login">Faça login</Link> para comentar.</p>
              )}
            </div>
          )}
        </section>

        <section className="detail-section detail-doc" id="documentation">
          <h2>Documentação</h2>
          {component.longDescriptionMd && (
            <div className="detail-doc-block">
              <h3>Descrição</h3>
              <div className="detail-markdown" dangerouslySetInnerHTML={{ __html: simpleMarkdown(component.longDescriptionMd) }} />
            </div>
          )}
          {component.dependenciesMd && (
            <div className="detail-doc-block">
              <h3>Dependências</h3>
              <div className="detail-markdown" dangerouslySetInnerHTML={{ __html: simpleMarkdown(component.dependenciesMd) }} />
            </div>
          )}
          {component.accessibilityMd && (
            <div className="detail-doc-block">
              <h3>Acessibilidade</h3>
              <div className="detail-markdown" dangerouslySetInnerHTML={{ __html: simpleMarkdown(component.accessibilityMd) }} />
            </div>
          )}
          {!component.longDescriptionMd && !component.dependenciesMd && !component.accessibilityMd && (
            <p className="detail-empty">Nenhuma documentação adicional.</p>
          )}
        </section>

        <section className="detail-section" id="versions">
          <h2>Histórico de versões</h2>
          {canEdit && (
            <button type="button" className="btn btn-ghost" onClick={handleSaveVersion} disabled={savingVersion} style={{ marginBottom: 'var(--spacing-md)' }}>
              {savingVersion ? 'Salvando...' : 'Criar nova versão (rascunho)'}
            </button>
          )}
          {versionsList.length === 0 ? (
            <p className="detail-empty">Nenhuma versão registrada.</p>
          ) : (
            <ul className="version-list">
              {versionsList.map((v) => (
                <li key={v.id}>
                  <strong>v{v.number}</strong>
                  {v.isPublished && <span className="detail-badge detail-badge-published" style={{ marginLeft: '0.5rem' }}>Publicada</span>}
                  {' — '}{new Date(v.createdAt).toLocaleDateString('pt-BR')}
                  {v.createdBy?.name && ` — ${v.createdBy.name}`}
                  {v.changelog && <div className="version-changelog">{String(v.changelog).slice(0, 120)}{String(v.changelog).length > 120 ? '…' : ''}</div>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <aside className="detail-toc" aria-label="Conteúdo">
        <div className="detail-toc-inner">
          <p className="detail-toc-title">Conteúdo</p>
          <ul className="detail-toc-list">
            <li><a href="#title" className={`detail-toc-link ${activeIndexId === 'title' ? 'active' : ''}`}>{component.title || component.name}</a></li>
            <li><a href="#preview-code-comments" className={`detail-toc-link ${activeIndexId === 'preview-code-comments' ? 'active' : ''}`}>Preview / Código / Comentários</a></li>
            <li><a href="#documentation" className={`detail-toc-link ${activeIndexId === 'documentation' ? 'active' : ''}`}>Documentação</a></li>
            <li><a href="#versions" className={`detail-toc-link ${activeIndexId === 'versions' ? 'active' : ''}`}>Histórico de versões</a></li>
          </ul>
        </div>
      </aside>

      {deleteModalOpen && (
        <div className="delete-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
          <div className="delete-modal">
            <div className="delete-modal-icon" aria-hidden="true">
              <span className="delete-modal-icon-x">×</span>
            </div>
            <h2 id="delete-modal-title" className="delete-modal-title">
              Excluir componente permanentemente?
            </h2>
            <p className="delete-modal-body">
              Isso apagará o componente, versões, variações e comentários. Essa ação não pode ser desfeita.
            </p>
            <div className="delete-modal-confirm-wrap">
              <label htmlFor="delete-confirm-slug">Digite o slug para confirmar:</label>
              <input
                id="delete-confirm-slug"
                type="text"
                value={deleteConfirmSlug}
                onChange={(e) => setDeleteConfirmSlug(e.target.value)}
                placeholder={component.slug || ''}
                className="delete-modal-input"
                autoComplete="off"
              />
            </div>
            <div className="delete-modal-actions">
              <button
                type="button"
                className="delete-modal-btn-cancel"
                onClick={() => { setDeleteModalOpen(false); setDeleteConfirmSlug(''); }}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="delete-modal-btn-delete"
                onClick={handleDeleteComponent}
                disabled={isDeleting || deleteConfirmSlug !== (component.slug || '')}
              >
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
