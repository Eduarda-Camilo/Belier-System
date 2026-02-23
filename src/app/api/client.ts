const API_BASE_URL = import.meta.env.VITE_API_URL as string | undefined;

if (!API_BASE_URL) {
  // Em desenvolvimento, é melhor falhar cedo se a URL da API não estiver configurada
  // (em produção, Vercel deve sempre ter VITE_API_URL configurado).
  console.warn(
    "[Belier API] VITE_API_URL não definido. Configure VITE_API_URL no .env.local e no Vercel."
  );
}

export interface LoginPayload {
  email: string;
  password: string;
}

// A resposta exata do backend pode variar; mantemos flexível aqui.
export interface LoginResponse {
  token?: string;
  user?: {
    id: string;
    name: string;
    role: "admin" | "designer" | "dev";
    email?: string;
  };
  [key: string]: unknown;
}

export interface ComponentSummary {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface ComponentVariant {
  id: string;
  componentId: string;
  title: string;
  description: string;
  codeSnippet: string;
  previewProps?: string;
  previewChildren?: string;
  orderIndex: number;
}

export interface ComponentDetail extends ComponentSummary {
  importDescription?: string;
  importSnippetIndividual?: string;
  importSnippetGlobal?: string;
  variants: ComponentVariant[];
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("API base URL (VITE_API_URL) não configurada");
  }

  const url = `${API_BASE_URL.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;

  const response = await fetch(url, {
    credentials: "include", // permite uso de cookies httpOnly se o backend usar
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const data = isJson ? await response.json() : (null as unknown as T);

  if (!response.ok) {
    const message =
      (isJson && ((data as any)?.message || (data as any)?.error)) ||
      `Erro na API (${response.status})`;
    throw new Error(message);
  }

  return data as T;
}

export const api = {
  login(payload: LoginPayload) {
    return apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  getComponents() {
    return apiFetch<ComponentSummary[]>("/components");
  },
  getComponentBySlug(slug: string) {
    return apiFetch<ComponentDetail>(`/components/${slug}`);
  },
  // Endpoints adicionais (comments, changelog, usuários, etc.) serão adicionados nas próximas fases.
};

