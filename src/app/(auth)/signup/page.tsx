import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Arinova Studio - Login"
};

export default function SignIn() {
  return <SignUpForm />;
}
