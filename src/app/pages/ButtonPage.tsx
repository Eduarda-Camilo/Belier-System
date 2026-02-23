import Pagina from "../../imports/Pagina-7-5044";
import { withProfileDropdown } from "../components/withProfileDropdown";
import { ButtonPageWrapper } from "../components/ButtonPageWrapper";

function ButtonPageContent() {
  return (
    <>
      <Pagina />
      <ButtonPageWrapper />
    </>
  );
}

const ButtonPage = withProfileDropdown(ButtonPageContent);
export default ButtonPage;