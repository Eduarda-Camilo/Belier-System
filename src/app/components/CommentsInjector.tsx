import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { useAuth } from "../auth/AuthContext";
import { api, type ComponentDetail, type Comment } from "../api/client";

function VariantComments({
  variantId,
  authorId,
}: {
  variantId: string;
  authorId: string | undefined;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getComments(variantId)
      .then((list) => {
        if (!cancelled) setComments(list);
      })
      .catch(() => {
        if (!cancelled) setComments([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [variantId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError(null);
    api
      .createComment(variantId, trimmed, authorId)
      .then((newComment) => {
        setComments((prev) => [...prev, newComment]);
        setText("");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Erro ao enviar comentário.");
      })
      .finally(() => setSending(false));
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-white/80">Comentários</p>
      {loading ? (
        <p className="text-sm text-white/50">Carregando...</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {comments.length === 0 ? (
            <li className="text-sm text-white/50">Nenhum comentário ainda.</li>
          ) : (
            comments.map((c) => (
              <li
                key={c.id}
                className="rounded-lg bg-white/5 px-3 py-2 text-sm text-white"
              >
                <span className="text-white/60 text-xs">
                  {new Date(c.createdAt).toLocaleString()}
                  {c.authorId ? ` · ${c.authorId}` : ""}
                </span>
                <p className="mt-1">{c.text}</p>
              </li>
            ))
          )}
        </ul>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escreva um comentário..."
          className="min-h-[80px] w-full resize-y rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40"
          rows={2}
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="self-start rounded-lg bg-[#0090f9] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {sending ? "Enviando..." : "Enviar"}
        </button>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </form>
    </div>
  );
}

/**
 * Injeta blocos de comentários por variante na página do componente.
 * Usa data-inject="variant-0-comments", "variant-1-comments", etc.
 */
export function CommentsInjector({
  componentData,
}: {
  componentData: ComponentDetail | null;
}) {
  const { user } = useAuth();
  const rootsRef = useRef<Map<string, { root: ReturnType<typeof createRoot>; el: HTMLElement }>>(new Map());

  useEffect(() => {
    if (!componentData) return;

    componentData.variants.forEach((variant, i) => {
      const container = document.querySelector(`[data-inject="variant-${i}-comments"]`);
      if (!container || !(container instanceof HTMLElement)) return;

      const key = `comments-${variant.id}`;
      let entry = rootsRef.current.get(key);
      if (!entry) {
        const root = createRoot(container);
        rootsRef.current.set(key, { root, el: container });
        entry = { root, el: container };
      }

      entry.root.render(
        <VariantComments variantId={variant.id} authorId={user?.id} />
      );
    });

    return () => {
      componentData.variants.forEach((variant) => {
        const key = `comments-${variant.id}`;
        const entry = rootsRef.current.get(key);
        if (entry) {
          entry.root.unmount();
          rootsRef.current.delete(key);
        }
      });
    };
  }, [componentData, user?.id]);

  return null;
}
