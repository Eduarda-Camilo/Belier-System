import { useEffect, useState } from "react";
import Pagina from "../../imports/Pagina-7-5044";
import { withProfileDropdown } from "../components/withProfileDropdown";
import { ButtonPageWrapper } from "../components/ButtonPageWrapper";
import { api, ComponentDetail } from "../api/client";

function ButtonPageContent() {
  const [componentData, setComponentData] = useState<ComponentDetail | null>(null);

  useEffect(() => {
    let isMounted = true;
    api
      .getComponentBySlug("button")
      .then((data) => {
        if (isMounted) {
          setComponentData(data);
        }
      })
      .catch((error) => {
        console.error("Erro ao carregar componente button:", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Por enquanto, mantemos o layout 100% igual ao Figma.
  // O componentData já está disponível em memória para uso futuro
  // (descrição, imports, variáveis) sem alterar o visual.

  return (
    <>
      <Pagina />
      <ButtonPageWrapper />
    </>
  );
}

const ButtonPage = withProfileDropdown(ButtonPageContent);
export default ButtonPage;