import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './ChangeLog.css';

function getPreviewCode(version) {
  const content = version.content || {};
  if (version.variationTitle && content.variationsSnapshot && content.variationsSnapshot.length > 0) {
    const variation = content.variationsSnapshot.find(
      (v) => v.title === version.variationTitle || (v.title && v.title.trim() === (version.variationTitle || '').trim())
    ) || content.variationsSnapshot[0];
    return variation.codeSnippet || content.defaultCode || '';
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

export default function ChangeLog() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/versions/changelog')
      .then((res) => setList(res.data || []))
      .catch((err) => setError(err.response?.data?.error || 'Erro ao carregar o changelog.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Carregando...</div>;

  return (
    <div className="page changelog-page">
      <div className="page-header">
        <h1>ChangeLog</h1>
      </div>
      {error && <div className="page-error">{error}</div>}
      {list.length === 0 && !error ? (
        <p className="page-empty">Nenhuma atualização registrada ainda.</p>
      ) : (
        <ul className="changelog-list">
          {list.map((v) => {
            const component = v.Component;
            const componentName = component?.title || component?.name || 'Componente';
            const variantName = v.variationTitle || null;
            const updatedBy = v.createdBy?.name || 'Desconhecido';
            const previewCode = getPreviewCode(v);
            const componentId = component?.id;

            return (
              <li key={v.id} className="changelog-card card">
                <div className="changelog-card-header">
                  <div className="changelog-card-titles">
                    {componentId ? (
                      <Link to={`/components/${componentId}`} className="changelog-component-link">
                        {componentName}
                      </Link>
                    ) : (
                      <span className="changelog-component-name">{componentName}</span>
                    )}
                    {variantName && (
                      <span className="changelog-variant-name"> / {variantName}</span>
                    )}
                  </div>
                  <div className="changelog-card-meta">
                    <span className="changelog-meta-by">Atualizado por {updatedBy}</span>
                    <span className="changelog-meta-date">{formatDateTime(v.createdAt)}</span>
                  </div>
                </div>
                {v.description && (
                  <p className="changelog-card-description">{v.description}</p>
                )}
                {previewCode && previewCode.trim() ? (
                  <div className="changelog-preview-wrap">
                    <iframe
                      title={`Preview ${componentName}${variantName ? ` - ${variantName}` : ''}`}
                      className="changelog-preview-iframe"
                      srcDoc={previewCode}
                      sandbox="allow-scripts"
                    />
                  </div>
                ) : (
                  <p className="changelog-no-preview">Sem preview disponível.</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
