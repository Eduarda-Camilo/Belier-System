import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext";

/**
 * Rota legada /button: mantém compatibilidade e aplica a mesma lógica da raiz.
 */
export default function LegacyButtonRedirectPage() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) {
      navigate("/components/button", { replace: true });
    } else {
      navigate("/components/button/public", { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  return null;
}

