import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { withProfileDropdown } from "../components/withProfileDropdown";
import { EditarComponenteWrapper } from "../components/EditarComponenteWrapper";
import EditarComponente from "../../imports/EditarComponente";
import { api } from "../api/client";
import type { ComponentDetail } from "../api/client";

const inputClass =
  "w-full min-w-0 bg-transparent border-none text-[14px] text-[#f5f5f5] outline-none font-['Open_Sans:Regular',sans-serif] placeholder:text-[#f5f5f5]/70";
const textareaClass = inputClass + " resize-none h-[54px]";

function EditarComponentePageContent() {
  const { id } = useParams<{ id: string }>();
  const containerRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const descInputRef = useRef<HTMLTextAreaElement | null>(null);
  const [component, setComponent] = useState<ComponentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    api
      .getComponentBySlug(id)
      .then((data) => {
        if (!cancelled) setComponent(data);
      })
      .catch(() => {
        if (!cancelled) setComponent(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root || !component) return;

    const nameWrap = root.querySelector('[data-inject="editar-name"]');
    const descWrap = root.querySelector('[data-inject="editar-description"]');
    const btnCancel = root.querySelector('[data-inject="editar-cancelar"]');
    const btnSalvar = root.querySelector('[data-inject="editar-salvar"]');
    const btnExcluir = root.querySelector('[data-inject="editar-excluir"]');

    if (nameWrap) {
      const p = nameWrap.querySelector("p");
      if (p) {
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Digite...";
        input.className = inputClass;
        input.value = component.name;
        input.setAttribute("data-inject-input", "editar-name");
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
        textarea.value = component.description ?? "";
        textarea.setAttribute("data-inject-input", "editar-description");
        p.replaceWith(textarea);
        descInputRef.current = textarea;
      }
    }

    const onCancel = () => navigate(`/components/${component.slug}`);
    const onSalvar = async () => {
      const name = nameInputRef.current?.value?.trim() ?? "";
      if (!name) {
        alert("Informe o nome do componente.");
        return;
      }
      const description = descInputRef.current?.value?.trim() ?? "";
      try {
        await api.updateComponent(component.id, {
          name,
          description: description || undefined,
          importDescription: component.importDescription,
          importSnippetIndividual: component.importSnippetIndividual,
          importSnippetGlobal: component.importSnippetGlobal,
          variants: component.variants.map((v) => ({
            id: v.id,
            title: v.title,
            description: v.description,
            codeSnippet: v.codeSnippet,
            previewProps: v.previewProps,
            previewChildren: v.previewChildren,
          })),
        });
        navigate(`/components/${component.slug}`);
      } catch (e) {
        alert(e instanceof Error ? e.message : "Erro ao salvar componente.");
      }
    };
    const onExcluir = async () => {
      if (component.slug === "button") {
        alert('O componente base "Button" não pode ser excluído.');
        return;
      }
      const confirmed = window.confirm(
        `Excluir o componente "${component.name}"? Essa ação não pode ser desfeita.`
      );
      if (!confirmed) return;
      try {
        await api.deleteComponent(component.id);
        navigate("/components/button");
      } catch (e) {
        alert(e instanceof Error ? e.message : "Erro ao excluir componente.");
      }
    };
    btnCancel?.addEventListener("click", onCancel);
    btnSalvar?.addEventListener("click", onSalvar);
    btnExcluir?.addEventListener("click", onExcluir);
    return () => {
      btnCancel?.removeEventListener("click", onCancel);
      btnSalvar?.removeEventListener("click", onSalvar);
      btnExcluir?.removeEventListener("click", onExcluir);
    };
  }, [component, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-white">
        Carregando...
      </div>
    );
  }
  if (id && !component) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] text-white gap-2">
        <p>Componente não encontrado.</p>
        <button
          type="button"
          className="text-[#16a6df] underline"
          onClick={() => navigate("/components/button")}
        >
          Voltar
        </button>
      </div>
    );
  }
  if (!id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] text-white gap-2">
        <p>Informe o ID ou slug do componente na URL (ex.: /editar-componente/button).</p>
        <button
          type="button"
          className="text-[#16a6df] underline"
          onClick={() => navigate("/components/button")}
        >
          Ir para componentes
        </button>
      </div>
    );
  }

  return (
    <>
      <div ref={containerRef}>
        <EditarComponente />
      </div>
      <EditarComponenteWrapper />
    </>
  );
}

const EditarComponentePage = withProfileDropdown(EditarComponentePageContent);
export default EditarComponentePage;
