import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router";
import ButtonSemLogin from "../../imports/ButtonSemLogin";
import { PublicPageWrapper } from "../components/PublicPageWrapper";
import { PublicNavigationInjector } from "../components/PublicNavigationInjector";
import { ComponentDataInjector } from "../components/ComponentDataInjector";
import { api, ComponentDetail } from "../api/client";

/**
 * Página pública de componente (sem login).
 * Usa o layout ButtonSemLogin como template para qualquer componente.
 */
function ComponentPagePublicContent() {
  const { slug } = useParams<{ slug: string }>();
  const [componentData, setComponentData] = useState<ComponentDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let isMounted = true;
    setError(null);
    api
      .getComponentBySlug(slug)
      .then((data) => {
        if (isMounted) setComponentData(data);
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Erro ao carregar");
          setComponentData(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (!slug) {
    return <Navigate to="/" replace />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#22272a] text-white">
        <div className="text-center">
          <p className="text-lg text-red-400">{error}</p>
          <p className="mt-2 text-sm text-white/60">Componente não encontrado: {slug}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ButtonSemLogin />
      <PublicPageWrapper />
      <PublicNavigationInjector />
      <ComponentDataInjector componentData={componentData} slug={slug} />
    </>
  );
}

export default ComponentPagePublicContent;
