import { createBrowserRouter } from "react-router";
import DocsPage from "./pages/DocsPage";
import DocsSemLoginPage from "./pages/DocsSemLoginPage";
import ButtonPage from "./pages/ButtonPage";
import ButtonSemLoginPage from "./pages/ButtonSemLoginPage";
import NovoComponentePage from "./pages/NovoComponentePage";
import EditarComponentePage from "./pages/EditarComponentePage";
import ChangeLogPage from "./pages/ChangeLogPage";
import ChangeLogEmptyPage from "./pages/ChangeLogEmptyPage";
import InboxPage from "./pages/InboxPage";
import UsuariosPage from "./pages/UsuariosPage";
import LoginPage from "./pages/LoginPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/",
    Component: DocsSemLoginPage,
  },
  {
    path: "/docs",
    Component: DocsPage,
  },
  {
    path: "/docs-public",
    Component: DocsSemLoginPage,
  },
  {
    path: "/components/button",
    Component: ButtonPage,
  },
  {
    path: "/components/button-public",
    Component: ButtonSemLoginPage,
  },
  {
    path: "/novo-componente",
    Component: NovoComponentePage,
  },
  {
    path: "/editar-componente",
    Component: EditarComponentePage,
  },
  {
    path: "/editar-componente/:id",
    Component: EditarComponentePage,
  },
  {
    path: "/changelog",
    Component: ChangeLogPage,
  },
  {
    path: "/changelog-empty",
    Component: ChangeLogEmptyPage,
  },
  {
    path: "/inbox",
    Component: InboxPage,
  },
  {
    path: "/usuarios",
    Component: UsuariosPage,
  },
  // Legacy routes (backwards compatibility)
  {
    path: "/button",
    Component: ButtonPage,
  },
  {
    path: "/button-public",
    Component: ButtonSemLoginPage,
  },
]);