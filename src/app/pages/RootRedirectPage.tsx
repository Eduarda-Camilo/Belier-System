import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext";

/**
 * Página raiz: decide para onde mandar o usuário
 * sem alterar layout (apenas redirect).
 */
export default function RootRedirectPage() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) {
      navigate("/components/button", { replace: true });
    } else {
      navigate("/components/button-public", { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  return null;
}

