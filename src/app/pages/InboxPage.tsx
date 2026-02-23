import Pagina from "../../imports/Pagina-10-4677";
import { withProfileDropdown } from "../components/withProfileDropdown";
import { DocsPageWrapper } from "../components/DocsPageWrapper";

function InboxPageContent() {
  return (
    <>
      <Pagina />
      <DocsPageWrapper />
    </>
  );
}

const InboxPage = withProfileDropdown(InboxPageContent);
export default InboxPage;