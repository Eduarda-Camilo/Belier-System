import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
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
      const start = i;
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

export default function ComponentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
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
  const [sectionTabs, setSectionTabs] = useState({});
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [activeIndexId, setActiveIndexId] = useState('title');

  const canEdit = ['admin', 'designer'].includes(user?.profile);
  const statusLabel = { draft: 'Rascunho', published: 'Publicado', archived: 'Arquivado' };
  const [savingVersion, setSavingVersion] = useState(false);

  const totalComments = comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);
  const loadComments = () => api.get(`/comments/component/${id}`).then((res) => setComments(res.data)).catch(() => {});

  useEffect(() => {
    setError('');
    setComponent(null);
    setLoading(true);
    const setData = (data) => {
      if (data && (data.id || data.name || data.title)) setComponent(data);
      else setError('Resposta inválida do servidor.');
    };
    api.get(`/components/${id}`, { params: { include: 'examples' } })
      .then((res) => setData(res.data))
      .catch(() =>
        api.get(`/components/${id}`).then((res) => setData(res.data))
      )
      .catch((err) => setError(err.response?.data?.error || 'Não foi possível carregar o componente. Verifique a conexão.'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    api.get(`/versions/component/${id}`).then((res) => setVersions(res.data)).catch(() => {});
    api.get(`/comments/component/${id}`).then((res) => setComments(res.data)).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!component) return;
    const tabs = {};
    tabs.default = 'preview';
    const vars = normalizeVariations(component.variations);
    for (let i = 0; i < vars.length; i++) {
      const key = `var-${vars[i].id || i}`;
      tabs[key] = 'preview';
    }
    setSectionTabs(tabs);
  }, [component]);

  useEffect(() => {
    const ids = ['title', 'default', ...(normalizeVariations(component?.variations).map((v, i) => `var-${v.id || i}`))];
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
      const { data } = await api.post(`/versions/component/${id}`, { description: `Versão ${(versions.length || 0) + 1}` });
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
      const { data } = await api.post(`/comments/component/${id}`, { text: commentText.trim() });
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
      await api.post(`/comments/component/${id}`, { text: replyText.trim(), parentId });
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

  const usageCodeDefault = component.defaultExample?.codeSnippet ?? component.documentation ?? '';
  const handleCopyCode = () => {
    navigator.clipboard.writeText(usageCodeDefault || '').then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 1500);
    });
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

  return (
    <div className="page detail-content-grid">
      <div className="detail-content">
        <div className="page-header" id="title">
          <div>
            <Link to="/components" className="back-link">← Componentes</Link>
            <h1>{component.title || component.name}</h1>
            <span className={`detail-badge detail-badge-${component.status}`}>
              {statusLabel[component.status]}
            </span>
            {component.Category && (
              <span className="detail-meta">Categoria: {component.Category.name}</span>
            )}
            {component.responsible && (
              <span className="detail-meta">Responsável: {component.responsible.name}</span>
            )}
          </div>
          {canEdit && (
            <Link to={`/components/${id}/edit`} className="btn btn-primary">Editar</Link>
          )}
        </div>

        {(component.shortDescription || component.description) && (
          <p className="detail-description">{component.shortDescription || component.description}</p>
        )}

        <div className="detail-search">
          <input className="detail-search-input" placeholder="Buscar..." />
        </div>

        <section className="detail-card" id="default">
          <h2>Default</h2>
          <p className="detail-meta">Descrição</p>
          <div className="usage-tabs section-tabs">
            <button
              type="button"
              className={`usage-tab section-tab ${sectionTabs.default === 'preview' ? 'active' : ''}`}
              onClick={() => setSectionTabs((t) => ({ ...t, default: 'preview' }))}
            >Preview</button>
            <button
              type="button"
              className={`usage-tab section-tab ${sectionTabs.default === 'code' ? 'active' : ''}`}
              onClick={() => setSectionTabs((t) => ({ ...t, default: 'code' }))}
            >Código</button>
          </div>
          {sectionTabs.default === 'code' ? (
            <div className="code-block-wrap">
              <button
                type="button"
                className="code-block-copy"
                onClick={handleCopyCode}
                title="Copiar"
                aria-label="Copiar código"
              >
                {copyFeedback ? (
                  <span className="code-copy-feedback">Copiado!</span>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                )}
              </button>
              <div className="code-block-with-lines">
                <div className="code-line-numbers" aria-hidden="true">
                  {(() => {
                    const code = usageCodeDefault || '// Nenhum código de uso definido.';
                    const lines = code.split('\n');
                    return lines.map((_, i) => (
                      <span key={i} className="code-ln">{i + 1}</span>
                    ));
                  })()}
                </div>
                <pre className="code-block">
                  {(usageCodeDefault || '// Nenhum código de uso definido.')
                    .split('\n')
                    .map((line, i) => (
                      <div key={i} className="code-line">
                        <code>{highlightCode(line)}</code>
                      </div>
                    ))}
                </pre>
              </div>
            </div>
          ) : (
            <div className="usage-preview-wrap">
              {usageCodeDefault && usageCodeDefault.trim() ? (
                <iframe
                  title="Pré-visualização"
                  className="usage-preview-iframe"
                  srcDoc={usageCodeDefault}
                  sandbox="allow-scripts"
                />
              ) : (
                <p className="detail-empty">Nenhum código de uso definido.</p>
              )}
            </div>
          )}
        </section>

        {(normalizeVariations(component.variations).length > 0) && (
          <div className="detail-variations-list">
            {normalizeVariations(component.variations).map((v, i) => {
              const key = `var-${v.id || i}`;
              const code = v.codeSnippet || '';
              return (
                <section key={key} className="detail-card" id={key}>
                  <h2>{v.title || `Variação ${i + 1}`}</h2>
                  {v.description ? <p className="detail-meta">{v.description}</p> : <p className="detail-meta">Descrição</p>}
                  <div className="usage-tabs section-tabs">
                    <button
                      type="button"
                      className={`usage-tab section-tab ${sectionTabs[key] === 'preview' ? 'active' : ''}`}
                      onClick={() => setSectionTabs((t) => ({ ...t, [key]: 'preview' }))}
                    >Preview</button>
                    <button
                      type="button"
                      className={`usage-tab section-tab ${sectionTabs[key] === 'code' ? 'active' : ''}`}
                      onClick={() => setSectionTabs((t) => ({ ...t, [key]: 'code' }))}
                    >Código</button>
                  </div>
                  {sectionTabs[key] === 'code' ? (
                    <div className="code-block-wrap">
                      <div className="code-block-with-lines">
                        <div className="code-line-numbers" aria-hidden="true">
                          {(() => {
                            const c = code || '// Nenhum código definido.';
                            const lines = c.split('\n');
                            return lines.map((_, j) => (
                              <span key={j} className="code-ln">{j + 1}</span>
                            ));
                          })()}
                        </div>
                        <pre className="code-block">
                          {(code || '// Nenhum código definido.')
                            .split('\n')
                            .map((line, j) => (
                              <div key={j} className="code-line">
                                <code>{highlightCode(line)}</code>
                              </div>
                            ))}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="usage-preview-wrap">
                      {code && code.trim() ? (
                        <iframe
                          title={`Pré-visualização ${v.title || i + 1}`}
                          className="usage-preview-iframe"
                          srcDoc={code}
                          sandbox="allow-scripts"
                        />
                      ) : (
                        <p className="detail-empty">Nenhum código definido.</p>
                      )}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}

        <section className="detail-section">
          <h2>Histórico de versões</h2>
          {canEdit && (
            <button type="button" className="btn btn-ghost" onClick={handleSaveVersion} disabled={savingVersion} style={{ marginBottom: 'var(--spacing-md)' }}>
              {savingVersion ? 'Salvando...' : 'Registrar versão atual'}
            </button>
          )}
          {versions.length === 0 ? (
            <p className="detail-empty">Nenhuma versão registrada.</p>
          ) : (
            <ul className="version-list">
              {versions.map((v) => (
                <li key={v.id}>
                  <strong>v{v.number}</strong> — {v.description || 'Sem descrição'} —{' '}
                  {new Date(v.createdAt).toLocaleDateString('pt-BR')}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="detail-section">
          <h2>Comentários ({totalComments})</h2>
          <ul className="comment-list">
            {comments.map((c) => (
              <li key={c.id} className="comment-item">
                <span className="comment-author">{c.User?.name || 'Usuário'}</span>
                <span className="comment-date">{new Date(c.createdAt).toLocaleString('pt-BR')}</span>
                {editingId === c.id ? (
                  <div className="comment-edit-box">
                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      rows={2}
                      className="comment-textarea"
                    />
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
          {user ? (
            <form onSubmit={handleSubmitComment} className="comment-form">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Escreva um comentário..."
                rows={3}
                className="comment-textarea"
              />
              <button type="submit" className="btn btn-primary" disabled={sendingComment || !commentText.trim()}>
                {sendingComment ? 'Enviando...' : 'Enviar comentário'}
              </button>
            </form>
          ) : (
            <p className="comment-login-hint"><Link to="/login">Faça login</Link> para comentar.</p>
          )}
        </section>
      </div>
      <aside className="detail-toc" aria-label="Conteúdo">
        <div className="detail-toc-inner">
          <p className="detail-toc-title">Conteúdo</p>
          <ul className="detail-toc-list">
            <li><a href="#title" className={`detail-toc-link ${activeIndexId === 'title' ? 'active' : ''}`}>{component.title || component.name}</a></li>
            <li><a href="#default" className={`detail-toc-link ${activeIndexId === 'default' ? 'active' : ''}`}>Default</a></li>
            {normalizeVariations(component.variations).map((v, i) => {
              const key = `var-${v.id || i}`;
              return (
                <li key={key}><a href={`#${key}`} className={`detail-toc-link ${activeIndexId === key ? 'active' : ''}`}>{v.title || `Variação ${i + 1}`}</a></li>
              );
            })}
          </ul>
        </div>
      </aside>
    </div>
  );
}
