import Pagina from "../../imports/Pagina-7-8351";
import { withProfileDropdown } from "../components/withProfileDropdown";

const ChangeLogPageWithProfile = withProfileDropdown(Pagina);

export default function ChangeLogPage() {
  return <ChangeLogPageWithProfile />;
}