import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import Pagina from "../../imports/Pagina-7-6659";
import { withProfileDropdown } from "../components/withProfileDropdown";
import { api } from "../api/client";

const inputClass =
  "w-full min-w-0 bg-transparent border-none text-[14px] text-[#f5f5f5] outline-none font-['Open_Sans:Regular',sans-serif] placeholder:text-[#f5f5f5]/70";
const textareaClass = inputClass + " resize-none h-[54px]";
const codeClass = inputClass + " font-['Source_Code_Pro:Regular',sans-serif] block w-full min-h-[80px] p-3 rounded";

function NovoComponentePageContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const descInputRef = useRef<HTMLTextAreaElement | null>(null);
  const variant0TitleRef = useRef<HTMLInputElement | null>(null);
  const variant0DescRef = useRef<HTMLTextAreaElement | null>(null);
  const variant0CodeRef = useRef<HTMLTextAreaElement | null>(null);
  const [extraVariants, setExtraVariants] = useState<Array<{ title: string; description: string; codeSnippet: string }>>([]);
  const setExtraVariantsRef = useRef(setExtraVariants);
  const extraVariantsRef = useRef(extraVariants);
  setExtraVariantsRef.current = setExtraVariants;
  extraVariantsRef.current = extraVariants;
  const navigate = useNavigate();

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const nameWrap = root.querySelector('[data-inject="novo-name"]');
    const descWrap = root.querySelector('[data-inject="novo-description"]');
    const v0TitleWrap = root.querySelector('[data-inject="novo-variant-0-title"]');
    const v0DescWrap = root.querySelector('[data-inject="novo-variant-0-description"]');
    const v0CodeWrap = root.querySelector('[data-inject="novo-variant-0-code"]');
    const btnCancel = root.querySelector('[data-inject="novo-cancelar"]');
    const btnSalvar = root.querySelector('[data-inject="novo-salvar"]');
    const btnAddVariante = root.querySelector('[data-inject="novo-add-variante"]');

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
    if (v0TitleWrap) {
      const p = v0TitleWrap.querySelector("p");
      if (p) {
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Ex: Default";
        input.className = inputClass;
        input.value = "Default";
        input.setAttribute("data-inject-input", "novo-variant-0-title");
        p.replaceWith(input);
        variant0TitleRef.current = input;
      }
    }
    if (v0DescWrap) {
      const p = v0DescWrap.querySelector("p");
      if (p) {
        const textarea = document.createElement("textarea");
        textarea.placeholder = "Digite...";
        textarea.className = textareaClass;
        textarea.value = "Variante padrão.";
        textarea.setAttribute("data-inject-input", "novo-variant-0-description");
        p.replaceWith(textarea);
        variant0DescRef.current = textarea;
      }
    }
    if (v0CodeWrap) {
      const content = v0CodeWrap.querySelector('[data-name="Content"]');
      const textHolder = content?.querySelector('[data-name="Text"]');
      if (textHolder) {
        const textarea = document.createElement("textarea");
        textarea.placeholder = "Código da variante...";
        textarea.className = codeClass;
        textarea.setAttribute("data-inject-input", "novo-variant-0-code");
        textHolder.replaceWith(textarea);
        variant0CodeRef.current = textarea;
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
      const v0Title = variant0TitleRef.current?.value?.trim() || "Default";
      const v0Desc = variant0DescRef.current?.value?.trim() || "Variante padrão.";
      const v0Code = variant0CodeRef.current?.value?.trim() ?? "";
      const variants = [
        { title: v0Title, description: v0Desc, codeSnippet: v0Code },
        ...extraVariantsRef.current,
      ];
      try {
        const res = await api.createComponent({
          name,
          description: description || undefined,
          variants,
        });
        navigate(`/components/${res.slug}`);
      } catch (e) {
        alert(e instanceof Error ? e.message : "Erro ao criar componente.");
      }
    };
    const onAddVariante = () => {
      setExtraVariantsRef.current((prev) => [
        ...prev,
        { title: `Variante ${prev.length + 2}`, description: "", codeSnippet: "" },
      ]);
    };

    btnCancel?.addEventListener("click", onCancel);
    btnSalvar?.addEventListener("click", onSalvar);
    btnAddVariante?.addEventListener("click", onAddVariante);
    return () => {
      btnCancel?.removeEventListener("click", onCancel);
      btnSalvar?.removeEventListener("click", onSalvar);
      btnAddVariante?.removeEventListener("click", onAddVariante);
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
