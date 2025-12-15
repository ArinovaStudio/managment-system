import ForgotPassword from "@/components/auth/ForgotPassword";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Arinova Studio - Login"
};

export default function SignIn() {
  return <ForgotPassword />;
}
