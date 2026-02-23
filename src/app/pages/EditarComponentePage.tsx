import { withProfileDropdown } from "../components/withProfileDropdown";
import { EditarComponenteWrapper } from "../components/EditarComponenteWrapper";
import EditarComponente from "../../imports/EditarComponente";

function EditarComponentePageContent() {
  return (
    <>
      <EditarComponente />
      <EditarComponenteWrapper />
    </>
  );
}

const EditarComponentePage = withProfileDropdown(EditarComponentePageContent);
export default EditarComponentePage;