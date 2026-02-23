import { createBrowserRouter, useParams } from "react-router";
import DocsPage from "./pages/DocsPage";
import DocsSemLoginPage from "./pages/DocsSemLoginPage";
import ComponentPage from "./pages/ComponentPage";
import ComponentPagePublic from "./pages/ComponentPagePublic";
import NovoComponentePage from "./pages/NovoComponentePage";
import EditarComponentePage from "./pages/EditarComponentePage";
import ChangeLogPage from "./pages/ChangeLogPage";
import ChangeLogEmptyPage from "./pages/ChangeLogEmptyPage";
import InboxPage from "./pages/InboxPage";
import UsuariosPage from "./pages/UsuariosPage";
import LoginPage from "./pages/LoginPage";
import RootRedirectPage from "./pages/RootRedirectPage";
import LegacyButtonRedirectPage from "./pages/LegacyButtonRedirectPage";
import LegacyButtonPublicRedirectPage from "./pages/LegacyButtonPublicRedirectPage";
import { RequireAuth } from "./auth/RequireAuth";
import { RequireRole } from "./auth/RequireRole";

function ComponentPageWithAuth() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <RequireAuth redirectTo={slug ? `/components/${slug}/public` : "/login"}>
      <ComponentPage />
    </RequireAuth>
  );
}

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/",
    Component: RootRedirectPage,
  },
  {
    path: "/docs",
    Component: () => (
      <RequireAuth redirectTo="/login">
        <DocsPage />
      </RequireAuth>
    ),
  },
  {
    path: "/docs-public",
    Component: DocsSemLoginPage,
  },
  // Compatibilidade: /components/button-public -> /components/button/public (deve vir antes de :slug)
  {
    path: "/components/button-public",
    Component: LegacyButtonPublicRedirectPage,
  },
  {
    path: "/components/:slug/public",
    Component: ComponentPagePublic,
  },
  {
    path: "/components/:slug",
    Component: ComponentPageWithAuth,
  },
  {
    path: "/novo-componente",
    Component: () => (
      <RequireRole allowed={["admin", "designer"]} redirectTo="/components/button">
        <NovoComponentePage />
      </RequireRole>
    ),
  },
  {
    path: "/editar-componente",
    Component: () => (
      <RequireAuth redirectTo="/login">
        <EditarComponentePage />
      </RequireAuth>
    ),
  },
  {
    path: "/editar-componente/:id",
    Component: () => (
      <RequireAuth redirectTo="/login">
        <EditarComponentePage />
      </RequireAuth>
    ),
  },
  {
    path: "/changelog",
    Component: () => (
      <RequireAuth redirectTo="/login">
        <ChangeLogPage />
      </RequireAuth>
    ),
  },
  {
    path: "/changelog-empty",
    Component: () => (
      <RequireAuth redirectTo="/login">
        <ChangeLogEmptyPage />
      </RequireAuth>
    ),
  },
  {
    path: "/inbox",
    Component: () => (
      <RequireAuth redirectTo="/login">
        <InboxPage />
      </RequireAuth>
    ),
  },
  {
    path: "/usuarios",
    Component: () => (
      <RequireRole allowed={["admin"]} redirectTo="/components/button">
        <UsuariosPage />
      </RequireRole>
    ),
  },
  // Legacy routes (backwards compatibility)
  {
    path: "/button",
    Component: LegacyButtonRedirectPage,
  },
  {
    path: "/button-public",
    Component: LegacyButtonPublicRedirectPage,
  },
]);