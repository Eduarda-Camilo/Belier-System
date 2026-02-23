import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "./AuthContext";

type Role = "admin" | "designer" | "dev";

export function RequireRole({
  children,
  allowed,
  redirectTo = "/components/button",
}: {
  children: ReactNode;
  allowed: Role[];
  redirectTo?: string;
}) {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }
    if (!user || !allowed.includes(user.role)) {
      navigate(redirectTo, { replace: true });
    }
  }, [allowed, isAuthenticated, loading, navigate, redirectTo, user]);

  if (loading) return null;
  if (!isAuthenticated) return null;
  if (!user || !allowed.includes(user.role)) return null;

  return <>{children}</>;
}

