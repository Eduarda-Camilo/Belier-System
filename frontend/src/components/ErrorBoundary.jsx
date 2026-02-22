import { Component } from 'react';
import { Link } from 'react-router-dom';

/**
 * Error Boundary para capturar erros de render e evitar tela em branco.
 * Mostra uma mensagem e link para voltar.
 */
export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page" style={{ padding: '2rem', maxWidth: '600px', minHeight: '200px', color: 'var(--color-text)', background: 'var(--color-bg)' }}>
          <h1 style={{ margin: '0 0 0.5rem' }}>Algo deu errado</h1>
          <p>Não foi possível exibir esta página. Tente voltar à lista ou recarregar.</p>
          {this.state.error && (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '1rem' }}>
              {String(this.state.error.message)}
            </p>
          )}
          <div style={{ marginTop: '1.5rem' }}>
            <Link to="/components" className="btn btn-primary">Ver componentes</Link>
            <button type="button" className="btn btn-ghost" style={{ marginLeft: '0.5rem' }} onClick={() => window.location.reload()}>
              Recarregar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
