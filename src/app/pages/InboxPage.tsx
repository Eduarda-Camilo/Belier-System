import Pagina from "../../imports/Pagina-10-4677";
import { withProfileDropdown } from "../components/withProfileDropdown";
import { DocsPageWrapper } from "../components/DocsPageWrapper";

function InboxPageContent() {
  return (
    <>
      <Pagina />
      <DocsPageWrapper />
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-xl bg-[#22272a] border border-[#3d4448] px-4 py-3 text-sm text-[#cbd4d6] shadow-lg z-10">
        Inbox em breve — as notificações de comentários aparecerão aqui quando disponível.
      </div>
    </>
  );
}

const InboxPage = withProfileDropdown(InboxPageContent);
export default InboxPage;