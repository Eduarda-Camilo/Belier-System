import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { api, LoginPayload, LoginResponse } from "../api/client";

type Role = "admin" | "designer" | "dev";

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "belier-auth-user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaura usuário do localStorage (apenas para conveniência do front)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AuthUser;
        setUser(parsed);
      }
    } catch {
      // ignore parse errors
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    setLoading(true);
    try {
      const res: LoginResponse = await api.login(payload);

      // Tentamos extrair user/role da resposta da API.
      // Se o backend tiver outro formato, ajustamos depois.
      const backendUser = res.user as AuthUser | undefined;
      if (!backendUser || !backendUser.role) {
        throw new Error("Resposta de login inválida (usuário/role ausentes).");
      }

      setUser(backendUser);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(backendUser));
    } catch (error) {
      // Modo desenvolvimento: permitir login fake enquanto o backend/usuários não existem.
      // Isso NÃO roda em produção (import.meta.env.DEV é false no Vercel).
      if (
        import.meta.env.DEV &&
        payload.email === "admin@belier.com" &&
        payload.password === "admin123"
      ) {
        const fakeUser: AuthUser = {
          id: "dev-admin",
          name: "Admin (dev)",
          email: payload.email,
          role: "admin",
        };
        setUser(fakeUser);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fakeUser));
        return;
      }

      // Se não for o caso de login fake, repassa o erro para o componente de Login mostrar.
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    window.localStorage.removeItem(STORAGE_KEY);
    // Se o backend usar cookies httpOnly, podemos depois adicionar um endpoint /auth/logout aqui.
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      loading,
      login,
      logout,
    }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return ctx;
}

