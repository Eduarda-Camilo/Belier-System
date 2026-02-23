import Pagina from "../../imports/Pagina-7-6659";
import { withProfileDropdown } from "../components/withProfileDropdown";
import { NovoComponenteWrapper } from "../components/NovoComponenteWrapper";

function NovoComponentePageContent() {
  return (
    <>
      <Pagina />
      <NovoComponenteWrapper />
    </>
  );
}

const NovoComponentePage = withProfileDropdown(NovoComponentePageContent);
export default NovoComponentePage;