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

export interface UpsertVariantPayload {
  id?: string;
  title: string;
  description: string;
  codeSnippet: string;
  previewProps?: string;
  previewChildren?: string;
}

export interface UpsertComponentPayload {
  name: string;
  description?: string;
  importDescription?: string;
  importSnippetIndividual?: string;
  importSnippetGlobal?: string;
  variants: UpsertVariantPayload[];
}

export interface Comment {
  id: string;
  variantId: string;
  authorId: string;
  text: string;
  createdAt: string;
}

export interface ChangelogEntry {
  id: string;
  saveEventId: string;
  componentId: string;
  variantId: string;
  variantTitle: string;
  codeSnippet: string;
  previewProps?: string;
  previewChildren?: string;
  componentName?: string;
  componentSlug?: string;
  authorId?: string;
  createdAt: string;
}

export interface ChangelogFilters {
  period?: "yesterday" | "1" | "7" | "7d" | "15" | "15d";
  from?: string;
  to?: string;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: "admin" | "designer" | "dev";
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: "admin" | "designer" | "dev";
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  role?: "admin" | "designer" | "dev";
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
  createComponent(payload: UpsertComponentPayload) {
    return apiFetch<ComponentDetail>("/components", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateComponent(id: string, payload: UpsertComponentPayload) {
    return apiFetch<ComponentDetail>(`/components/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  deleteComponent(id: string) {
    return apiFetch<void>(`/components/${id}`, {
      method: "DELETE",
    });
  },
  getComments(variantId: string) {
    return apiFetch<Comment[]>(`/variants/${variantId}/comments`);
  },
  createComment(variantId: string, text: string, authorId?: string) {
    return apiFetch<Comment>(`/variants/${variantId}/comments`, {
      method: "POST",
      body: JSON.stringify({ text, authorId }),
    });
  },
  getChangelog(filters: ChangelogFilters = {}) {
    const params = new URLSearchParams();
    if (filters.period) params.set("period", filters.period);
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    const qs = params.toString();
    const path = qs ? `/changelog?${qs}` : "/changelog";
    return apiFetch<ChangelogEntry[]>(path);
  },
  getUsers() {
    return apiFetch<UserSummary[]>("/users");
  },
  createUser(payload: CreateUserPayload) {
    return apiFetch<UserSummary>("/users", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateUser(id: string, payload: UpdateUserPayload) {
    return apiFetch<UserSummary>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  deleteUser(id: string) {
    return apiFetch<void>(`/users/${id}`, {
      method: "DELETE",
    });
  },
};

