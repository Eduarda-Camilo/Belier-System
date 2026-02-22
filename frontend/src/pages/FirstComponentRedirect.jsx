import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../services/api';

/**
 * Usado nas rotas index "/" e "/components": redireciona para o primeiro componente
 * da lista em vez de mostrar "Selecione um componente no menu lateral."
 */
export default function FirstComponentRedirect() {
  const [firstId, setFirstId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/components')
      .then((res) => {
        const list = res.data || [];
        if (list.length > 0) setFirstId(list[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Carregando...</div>;
  if (firstId) return <Navigate to={`/components/${firstId}`} replace />;
  return <p className="page-empty">Nenhum componente cadastrado.</p>;
}
