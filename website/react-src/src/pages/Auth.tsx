import { JSX, ReactNode } from "react";
import LoginPage from "./LoginPage";

type AuthProps = {
  children: ReactNode;
};

const Auth = ({ children }: AuthProps): JSX.Element => {
  const authToken = localStorage.getItem("authToken");

  if (!authToken) {
    return <LoginPage />;
  }

  return <>{children}</>;
};

export default Auth;
