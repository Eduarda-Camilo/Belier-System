import Prism from "prismjs";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";

/**
 * Destaca trecho de código para JSX/TSX (estilo IDE).
 * Fallback para markup se não for JSX.
 */
function getLanguage(code: string): string {
  const trimmed = code.trim();
  if (trimmed.startsWith("<") || /\b(import|export|const|let|var)\b/.test(trimmed)) {
    return "jsx";
  }
  return "markup";
}

export function highlightCode(code: string): string {
  if (!code.trim()) return "";
  const lang = getLanguage(code);
  try {
    const grammar = lang === "jsx" ? Prism.languages.jsx : Prism.languages.markup;
    return Prism.highlight(code, grammar, lang);
  } catch {
    return escapeHtml(code);
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
