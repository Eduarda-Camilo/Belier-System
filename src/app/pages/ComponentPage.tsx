import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router";
import Pagina from "../../imports/Pagina-7-5044";
import { withProfileDropdown } from "../components/withProfileDropdown";
import { ComponentDataInjector } from "../components/ComponentDataInjector";
import { api, ComponentDetail } from "../api/client";

function ComponentPageContent() {
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
      <Pagina />
      <ComponentDataInjector componentData={componentData} slug={slug} />
    </>
  );
}

const ComponentPage = withProfileDropdown(ComponentPageContent);
export default ComponentPage;
