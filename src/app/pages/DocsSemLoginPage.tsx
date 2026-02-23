import DocsPublic from "../../imports/DocsPublic";
import { PublicPageWrapper } from "../components/PublicPageWrapper";
import { PublicNavigationInjector } from "../components/PublicNavigationInjector";

/**
 * Página Docs Sem Login
 * Usa o componente correto DocsPublic do Figma
 */
export default function DocsSemLoginPage() {
  return (
    <>
      <DocsPublic />
      <PublicPageWrapper />
      <PublicNavigationInjector />
    </>
  );
}