import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password.trim());
      navigate('/');
    } catch (err) {
      const msg = !err?.response
        ? 'Não foi possível conectar. Verifique a conexão.'
        : (err.response?.data?.error || 'Falha no login. Verifique email e senha.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <aside className="auth-panel-left">
          <div className="auth-brand">
            <span className="auth-logo-icon">◆</span>
            <span className="auth-logo-text">Belier</span>
          </div>
          <h2 className="auth-welcome-title">Comece com a gente</h2>
          <p className="auth-welcome-subtitle">
            Faça login para acessar a documentação de componentes e colaborar com a equipe.
          </p>
          <div className="auth-step-list">
            <div className="auth-step-item active">
              <span className="auth-step-num">1</span>
              <span>Entrar na sua conta</span>
            </div>
            <div className="auth-step-item">
              <span className="auth-step-num">2</span>
              <span>Explorar componentes</span>
            </div>
            <div className="auth-step-item">
              <span className="auth-step-num">3</span>
              <span>Documentar e colaborar</span>
            </div>
          </div>
        </aside>

        <div className="auth-panel-right">
          <h1 className="page-title auth-form-title">Entrar</h1>
          <p className="auth-form-subtitle">
            Digite seu email e senha para acessar o sistema.
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="auth-error" role="alert">{error}</div>}
            <label className="auth-label">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="ex.: seu@email.com"
                className="auth-input"
              />
            </label>
            <label className="auth-label">
              Senha
              <div className="auth-password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Digite sua senha"
                  className="auth-input auth-input-password"
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </label>
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="auth-switch">
            Não tem conta? <Link to="/register" className="auth-switch-link">Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
