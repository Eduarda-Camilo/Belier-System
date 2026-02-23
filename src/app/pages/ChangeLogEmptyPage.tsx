import Pagina from "../../imports/Pagina-7-8615";
import { withProfileDropdown } from "../components/withProfileDropdown";

const ChangeLogEmptyPageWithProfile = withProfileDropdown(Pagina);

export default function ChangeLogEmptyPage() {
  return <ChangeLogEmptyPageWithProfile />;
}