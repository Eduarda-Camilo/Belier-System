import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import './ChangeLog.css';

const LIMIT = 50;
const AGGREGATION_WINDOW_MS = 5 * 60 * 1000; // 5 minutos

function getPreviewCode(item) {
  if (item?.Example?.codeSnippet) return item.Example.codeSnippet;
  const content = item?.content || {};
  if (item?.variationTitle && content.variationsSnapshot && content.variationsSnapshot.length > 0) {
    const variation = content.variationsSnapshot.find(
      (v) => (v.title || '').trim() === (item.variationTitle || '').trim()
    ) || content.variationsSnapshot.find((v) => v.title) || content.variationsSnapshot[0];
    return variation?.codeSnippet || '';
  }
  if (content.defaultCode) return content.defaultCode;
  if (content.variationsSnapshot && content.variationsSnapshot[0]) {
    return content.variationsSnapshot[0].codeSnippet || '';
  }
  return '';
}

function formatDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRelative(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `Há ${diffMins} min`;
  if (diffHours < 24) return `Há ${diffHours}h`;
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `Há ${diffDays} dias`;
  return formatDateTime(iso);
}

/**
 * Agrupa eventos (versões) por componentId e janela de 5 min (mais recente primeiro).
 * Retorna array de cards: cada card tem { componentId, componentName, componentSlug, events: [...] }.
 */
function aggregateIntoCards(items) {
  if (!items || items.length === 0) return [];
  const cards = [];
  let currentCard = null;
  for (const v of items) {
    const compId = v.componentId;
    const compName = v.Component?.title || v.Component?.name || 'Componente';
    const compSlug = v.Component?.slug;
    const createdAt = v.createdAt ? new Date(v.createdAt).getTime() : 0;
    const isWithinWindow = currentCard
      && currentCard.componentId === compId
      && (currentCard.mostRecent - createdAt) <= AGGREGATION_WINDOW_MS;
    if (currentCard && isWithinWindow) {
      currentCard.events.push(v);
      // manter mostRecent como o mais antigo do grupo (primeiro evento)
    } else {
      currentCard = {
        componentId: compId,
        componentName: compName,
        componentSlug: compSlug,
        mostRecent: createdAt,
        events: [v],
      };
      cards.push(currentCard);
    }
  }
  return cards;
}

export default function ChangeLog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const range = searchParams.get('range') || '';
  const type = searchParams.get('type') || 'all';
  const author = searchParams.get('author') || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  const [data, setData] = useState({ items: [], total_count: 0, page: 1, page_count: 1 });
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = { limit: LIMIT, page };
    if (range) params.range = range;
    if (type && type !== 'all') params.type = type;
    if (author) params.author = author;
    setLoading(true);
    setError('');
    api
      .get('/versions/changelog', { params })
      .then((res) => {
        const d = res.data || {};
        setError('');
        setData({
          items: Array.isArray(d.items) ? d.items : [],
          total_count: d.total_count ?? 0,
          page: d.page ?? 1,
          page_count: d.page_count ?? 1,
        });
      })
      .catch((err) => {
        const msg = err.response?.data?.error || err.message || 'Erro ao carregar o changelog.';
        setError(msg);
        setData((prev) => ({ ...prev, items: [] }));
      })
      .finally(() => setLoading(false));
  }, [range, type, author, page]);

  useEffect(() => {
    api.get('/versions/changelog/authors').then((res) => setAuthors(res.data || [])).catch(() => setAuthors([]));
  }, []);

  const cards = useMemo(() => aggregateIntoCards(data.items), [data.items]);

  const setFilters = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v === '' || v === undefined) next.delete(k);
      else next.set(k, String(v));
    });
    next.set('page', '1');
    setSearchParams(next);
  };

  const setPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(Math.max(1, Math.min(p, data.page_count))));
    setSearchParams(next);
  };

  const startItem = (data.page - 1) * LIMIT + 1;
  const endItem = Math.min(data.page * LIMIT, data.total_count);

  return (
    <div className="page changelog-page">
      <div className="changelog-page-header">
        <h1 className="page-title">Changelog</h1>
        <span className="changelog-total">{loading && data.items.length === 0 ? '—' : `${data.total_count} atualizações`}</span>
      </div>

      <div className="changelog-filters">
        <div className="changelog-filter-group">
          <span className="changelog-filter-label">Data:</span>
          {['', 'today', 'yesterday', '7d', '15d'].map((r) => (
            <button
              key={r || 'all'}
              type="button"
              className={`changelog-chip ${range === r ? 'active' : ''}`}
              onClick={() => setFilters({ range: r })}
            >
              {r === '' ? 'Todas' : r === 'today' ? 'Hoje' : r === 'yesterday' ? 'Ontem' : r === '7d' ? 'Últimos 7 dias' : 'Últimos 15 dias'}
            </button>
          ))}
        </div>
        <div className="changelog-filter-group">
          <span className="changelog-filter-label">Tipo:</span>
          <select
            className="changelog-select"
            value={type}
            onChange={(e) => setFilters({ type: e.target.value })}
          >
            <option value="all">Todos</option>
            <option value="component">Componentes (docs/metadados)</option>
            <option value="variant">Subcomponentes (variações)</option>
            <option value="publish">Publicações</option>
          </select>
        </div>
        <div className="changelog-filter-group">
          <span className="changelog-filter-label">Autor:</span>
          <select
            className="changelog-select"
            value={author}
            onChange={(e) => setFilters({ author: e.target.value })}
          >
            <option value="">Qualquer pessoa</option>
            {authors.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="page-error" role="alert">{error}</div>}

      {loading && data.items.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', minHeight: 160, alignItems: 'center' }}>
          <p className="page-loading" style={{ margin: 0 }}>Carregando...</p>
        </div>
      ) : !loading && cards.length === 0 && !error ? (
        <p className="page-empty">Nenhuma atualização no changelog para os filtros selecionados. Altere os filtros ou aguarde novas publicações.</p>
      ) : null}

      {cards.length > 0 && (
        <>
          <ul className="changelog-list">
            {cards.map((card) => {
              const isSingle = card.events.length === 1;
              const first = card.events[0];
              const componentId = card.componentId;
              const linkTo = `/components/${componentId}`;
              const versionId = first?.id;
              const variantSlug = first?.variationTitle ? String(first.variationTitle).toLowerCase().replace(/\s+/g, '-') : '';
              const qs = new URLSearchParams();
              if (versionId) qs.set('version', versionId);
              if (variantSlug) qs.set('variant', variantSlug);
              qs.set('tab', 'changelog');
              const linkWithParams = qs.toString() ? `${linkTo}?${qs.toString()}` : linkTo;

              return (
                <li key={`${card.componentId}-${card.mostRecent}`} className="changelog-card card">
                  <div className="changelog-card-header">
                    <div className="changelog-card-titles">
                      <Link to={linkTo} className="changelog-component-link">
                        {card.componentName}
                      </Link>
                    </div>
                    <div className="changelog-card-meta">
                      <span className="changelog-meta-date" title={formatDateTime(first?.createdAt)}>
                        {formatRelative(first?.createdAt)}
                      </span>
                      <span className="changelog-meta-by">
                        {isSingle
                          ? (first?.createdBy?.name || 'Desconhecido')
                          : `Vários autores (${card.events.length} atualizações)`}
                      </span>
                    </div>
                  </div>

                  {isSingle ? (
                    <>
                      {first.variationTitle && (
                        <p className="changelog-subcomponent-label">Subcomponente atualizado: {first.variationTitle}</p>
                      )}
                      {!first.variationTitle && first.isPublished && (
                        <p className="changelog-docs-label">Documentação / Publicação</p>
                      )}
                      {getPreviewCode(first)?.trim() ? (
                        <div className="changelog-preview-wrap">
                          <iframe
                            title={`Preview ${card.componentName}${first.variationTitle ? ` - ${first.variationTitle}` : ''}`}
                            className="changelog-preview-iframe"
                            srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${getPreviewCode(first)}</body></html>`}
                            sandbox="allow-same-origin"
                          />
                        </div>
                      ) : (
                        <p className="changelog-no-preview">Sem preview disponível.</p>
                      )}
                    </>
                  ) : (
                    <ul className="changelog-card-sublist">
                      {card.events.map((ev) => (
                        <li key={ev.id} className="changelog-sublist-item">
                          <div className="changelog-sublist-head">
                            <span className="changelog-sublist-title">{ev.variationTitle || 'Default'}</span>
                            <span className="changelog-sublist-by">{ev.createdBy?.name || 'Desconhecido'}</span>
                          </div>
                          {getPreviewCode(ev)?.trim() ? (
                            <div className="changelog-preview-wrap changelog-preview-mini">
                              <iframe
                                title={`Preview ${ev.variationTitle || 'Default'}`}
                                className="changelog-preview-iframe"
                                srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${getPreviewCode(ev)}</body></html>`}
                                sandbox="allow-same-origin"
                              />
                            </div>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="changelog-card-footer">
                    <Link to={linkWithParams} className="btn btn-primary btn-sm">
                      Ir para o componente
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>

          {data.page_count > 1 && (
            <div className="changelog-pagination">
              <p className="changelog-pagination-info">
                Mostrando {startItem}–{endItem} de {data.total_count}
              </p>
              <div className="changelog-pagination-btns">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={data.page <= 1}
                  onClick={() => setPage(data.page - 1)}
                >
                  Anterior
                </button>
                {Array.from({ length: Math.min(5, data.page_count) }, (_, i) => {
                  let p;
                  if (data.page_count <= 5) p = i + 1;
                  else if (data.page <= 3) p = i + 1;
                  else if (data.page >= data.page_count - 2) p = data.page_count - 4 + i;
                  else p = data.page - 2 + i;
                  return (
                    <button
                      key={p}
                      type="button"
                      className={`btn btn-sm ${data.page === p ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={data.page >= data.page_count}
                  onClick={() => setPage(data.page + 1)}
                >
                  Próximo
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
