import ButtonSemLogin from "../../imports/ButtonSemLogin";
import { PublicPageWrapper } from "../components/PublicPageWrapper";
import { PublicNavigationInjector } from "../components/PublicNavigationInjector";

export default function ButtonSemLoginPage() {
  return (
    <>
      <ButtonSemLogin />
      <PublicPageWrapper />
      <PublicNavigationInjector />
    </>
  );
}