import * as React from "react";
import { Button } from "../components/ui/button";
import type { ComponentVariant } from "../api/client";

/**
 * Registry de componentes para preview.
 * Mapeia slug do componente -> componente React que recebe previewProps e previewChildren.
 * Usado para renderizar previews sem executar código do banco.
 */
export type PreviewComponentProps = {
  previewProps?: Record<string, unknown>;
  previewChildren?: React.ReactNode;
};

export type PreviewComponent = React.ComponentType<PreviewComponentProps>;

const registry: Record<string, PreviewComponent> = {
  button: ({ previewProps, previewChildren }) => {
    const props = previewProps || {};
    return (
      <Button
        variant={(props.variant as "default" | "destructive" | "outline") || "default"}
        disabled={!!props.disabled}
        {...props}
      >
        {previewChildren ?? "Button"}
      </Button>
    );
  },
};

/**
 * Registra um componente de preview para um slug.
 * Útil para adicionar novos componentes ao sistema.
 */
export function registerPreview(slug: string, component: PreviewComponent): void {
  registry[slug] = component;
}

/**
 * Obtém o componente de preview para um slug.
 * Retorna um fallback genérico se o slug não estiver registrado.
 */
export function getPreviewComponent(slug: string): PreviewComponent {
  return (
    registry[slug] ??
    (({ previewChildren }) => (
      <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
        {previewChildren ?? slug}
      </div>
    ))
  );
}

/**
 * Renderiza o preview de uma variante usando o registry.
 */
export function renderPreview(
  slug: string,
  variant: ComponentVariant
): { props: Record<string, unknown>; children: React.ReactNode } {
  let props: Record<string, unknown> = {};
  let children: React.ReactNode = variant.previewChildren ?? "";

  try {
    if (variant.previewProps) {
      props = JSON.parse(variant.previewProps) as Record<string, unknown>;
    }
  } catch {
    // ignora JSON inválido
  }

  return { props, children };
}
