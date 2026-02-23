import { withProfileDropdown } from "../components/withProfileDropdown";
import { DocsPageWrapper } from "../components/DocsPageWrapper";
import Pagina from "../../imports/Pagina-11-4684";

function DocsPageContent() {
  return (
    <>
      <Pagina />
      <DocsPageWrapper />
    </>
  );
}

const DocsPage = withProfileDropdown(DocsPageContent);
export default DocsPage;