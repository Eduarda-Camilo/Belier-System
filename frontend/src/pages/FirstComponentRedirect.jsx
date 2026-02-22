import { Navigate } from 'react-router-dom';
import { useComponents } from '../contexts/ComponentsContext';

/**
 * Usado nas rotas index "/" e "/components": redireciona para o primeiro componente
 * da lista (do contexto do Layout) em vez de fazer um fetch próprio.
 */
export default function FirstComponentRedirect() {
  const { components, loading } = useComponents();

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '120px' }}>
        <p className="page-loading" style={{ margin: 0, fontSize: '0.95rem' }}>Carregando...</p>
      </div>
    );
  }
  if (components.length > 0) {
    return <Navigate to={`/components/${components[0].id}`} replace />;
  }
  return <p className="page-empty">Nenhum componente cadastrado.</p>;
}
