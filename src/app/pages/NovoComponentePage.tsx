import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import Pagina from "../../imports/Pagina-7-6659";
import { withProfileDropdown } from "../components/withProfileDropdown";
import { api } from "../api/client";

const inputClass =
  "w-full min-w-0 bg-transparent border-none text-[14px] text-[#f5f5f5] outline-none font-['Open_Sans:Regular',sans-serif] placeholder:text-[#f5f5f5]/70";
const textareaClass = inputClass + " resize-none h-[54px]";

function NovoComponentePageContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const descInputRef = useRef<HTMLTextAreaElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const nameWrap = root.querySelector('[data-inject="novo-name"]');
    const descWrap = root.querySelector('[data-inject="novo-description"]');
    const btnCancel = root.querySelector('[data-inject="novo-cancelar"]');
    const btnSalvar = root.querySelector('[data-inject="novo-salvar"]');

    if (nameWrap) {
      const p = nameWrap.querySelector("p");
      if (p) {
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Digite...";
        input.className = inputClass;
        input.setAttribute("data-inject-input", "novo-name");
        p.replaceWith(input);
        nameInputRef.current = input;
      }
    }
    if (descWrap) {
      const p = descWrap.querySelector("p");
      if (p) {
        const textarea = document.createElement("textarea");
        textarea.placeholder = "Digite...";
        textarea.className = textareaClass;
        textarea.setAttribute("data-inject-input", "novo-description");
        p.replaceWith(textarea);
        descInputRef.current = textarea;
      }
    }

    const onCancel = () => navigate("/components/button");
    const onSalvar = async () => {
      const name = nameInputRef.current?.value?.trim() ?? "";
      if (!name) {
        alert("Informe o nome do componente.");
        return;
      }
      const description = descInputRef.current?.value?.trim() ?? "";
      try {
        const res = await api.createComponent({
          name,
          description: description || undefined,
          variants: [
            {
              title: "Default",
              description: "Variante padrão.",
              codeSnippet: "",
            },
          ],
        });
        navigate(`/components/${res.slug}`);
      } catch (e) {
        alert(e instanceof Error ? e.message : "Erro ao criar componente.");
      }
    };

    btnCancel?.addEventListener("click", onCancel);
    btnSalvar?.addEventListener("click", onSalvar);
    return () => {
      btnCancel?.removeEventListener("click", onCancel);
      btnSalvar?.removeEventListener("click", onSalvar);
    };
  }, [navigate]);

  return (
    <div ref={containerRef}>
      <Pagina />
    </div>
  );
}

const NovoComponentePage = withProfileDropdown(NovoComponentePageContent);
export default NovoComponentePage;
