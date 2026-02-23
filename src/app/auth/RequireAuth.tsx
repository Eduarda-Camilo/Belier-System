import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "./AuthContext";

export function RequireAuth({
  children,
  redirectTo = "/login",
}: {
  children: ReactNode;
  redirectTo?: string;
}) {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, redirectTo]);

  if (loading) return null;
  if (!isAuthenticated) return null;

  return <>{children}</>;
}

