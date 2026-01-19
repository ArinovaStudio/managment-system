import SignInForm from "@/components/auth/SignInForm";
import { appConfig } from "@/config/appConfig";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `${appConfig.name} - Login`
};

export default function SignIn() {
  return <SignInForm />;
}
