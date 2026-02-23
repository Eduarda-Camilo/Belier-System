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
      navigate("/components/button/public", { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Enquanto decide o destino, mostra uma pequena tela de carregamento
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#22272a] text-white">
      <div className="text-center">
        <p className="text-lg">Carregando…</p>
        <p className="mt-2 text-sm text-white/60">
          Redirecionando para o componente Button.
        </p>
      </div>
    </div>
  );
}

