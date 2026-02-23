import { useEffect } from "react";
import { useNavigate } from "react-router";

/**
 * Rota legada /button-public: redireciona para /components/button/public.
 */
export default function LegacyButtonPublicRedirectPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/components/button/public", { replace: true });
  }, [navigate]);

  return null;
}
