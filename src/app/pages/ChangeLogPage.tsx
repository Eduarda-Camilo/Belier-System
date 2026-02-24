import Pagina from "../../imports/Pagina-7-8351";
import { withProfileDropdown } from "../components/withProfileDropdown";
import { ChangelogDataInjector } from "../components/ChangelogDataInjector";

function ChangeLogPageContent() {
  return (
    <>
      <Pagina />
      <ChangelogDataInjector />
    </>
  );
}

const ChangeLogPageWithProfile = withProfileDropdown(ChangeLogPageContent);

export default function ChangeLogPage() {
  return <ChangeLogPageWithProfile />;
}