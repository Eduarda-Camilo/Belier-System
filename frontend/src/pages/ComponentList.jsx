import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../services/api';
import './ComponentList.css';

export default function ComponentList() {
  const [firstId, setFirstId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/components')
      .then((res) => {
        const list = res.data || [];
        setFirstId(list[0]?.id || null);
      })
      .catch((err) => setError(err.response?.data?.error || 'Erro ao carregar componentes'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Carregando...</div>;
  if (error) return <div className="page-error">{error}</div>;
  if (!firstId) return <div className="page-empty">Nenhum componente cadastrado.</div>;
  return <Navigate to={`/components/${firstId}`} replace />;
}
