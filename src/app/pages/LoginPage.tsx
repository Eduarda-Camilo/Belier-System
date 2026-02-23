import TelaDeLogin from "../../imports/TelaDeLogin";
import { LoginNavigationInjector } from "../components/LoginNavigationInjector";
import { LoginPageWrapper } from "../components/LoginPageWrapper";

export default function LoginPage() {
  return (
    <>
      <TelaDeLogin />
      <LoginPageWrapper />
      <LoginNavigationInjector />
    </>
  );
}