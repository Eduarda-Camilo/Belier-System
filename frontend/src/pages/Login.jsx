import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const BANNERS = [
  {
    title: 'Design System em um só lugar',
    text: 'Documente componentes, variações e padrões para toda a equipe.',
  },
  {
    title: 'Colaboração e histórico',
    text: 'Comentários, versões e responsáveis por componente.',
  },
  {
    title: 'Categorias e busca',
    text: 'Organize por tipo e encontre o que precisa rapidamente.',
  },
];

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setCarouselIndex((i) => (i + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  if (user) return <Navigate to="/components" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password.trim());
      navigate('/components');
    } catch (err) {
      const msg = !err?.response
        ? 'Não foi possível conectar à API. Você configurou o backend e a variável VITE_API_URL na Vercel?'
        : (err.response?.data?.error || 'Falha no login. Verifique email e senha.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-logo" aria-hidden="true">
          <span className="login-logo-icon">◆</span>
          <span className="login-logo-text">Belier-System</span>
        </div>

        <div className="login-layout">
          <div className="login-panel">
            <h1 className="login-title">Entrar</h1>
            <p className="login-subtitle">
              Bem-vindo ao Belier-System. Faça login para continuar.
            </p>
            <form onSubmit={handleSubmit} className="login-form">
              {error && <div className="login-error">{error}</div>}
              <label>
                E-mail
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="seu@email.com"
                />
              </label>
              <label>
                Senha
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
              </label>
              <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          </div>

          <div className="login-carousel-wrap">
            <div className="login-carousel">
              {BANNERS.map((b, i) => (
                <div
                  key={i}
                  className={`login-carousel-slide ${i === carouselIndex ? 'active' : ''}`}
                  aria-hidden={i !== carouselIndex}
                >
                  <div className="login-carousel-visual">
                    <div className="login-banner-placeholder" />
                  </div>
                  <p className="login-carousel-title">{b.title}</p>
                  <p className="login-carousel-text">{b.text}</p>
                </div>
              ))}
            </div>
            <div className="login-carousel-dots" role="tablist" aria-label="Banners">
              {BANNERS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === carouselIndex}
                  aria-label={`Banner ${i + 1}`}
                  className={`login-carousel-dot ${i === carouselIndex ? 'active' : ''}`}
                  onClick={() => setCarouselIndex(i)}
                />
              ))}
            </div>
          </div>
        </div>

        <footer className="login-footer">
          <p>© Belier-System. Design System / Component Library.</p>
        </footer>
      </div>
    </div>
  );
}
