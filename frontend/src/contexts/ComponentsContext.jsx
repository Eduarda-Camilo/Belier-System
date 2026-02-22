import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';

const ComponentsContext = createContext(null);

export function ComponentsProvider({ children }) {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(() => {
    setLoading(true);
    api.get('/components')
      .then((res) => setComponents(res.data || []))
      .catch(() => setComponents([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <ComponentsContext.Provider value={{ components, loading, refetch, setComponents }}>
      {children}
    </ComponentsContext.Provider>
  );
}

export function useComponents() {
  const ctx = useContext(ComponentsContext);
  return ctx || { components: [], loading: false, refetch: () => {}, setComponents: () => {} };
}
