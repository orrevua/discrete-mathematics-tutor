import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";

export default async function AuthPage({ params }: { params: Promise<{ pathname: string }> }) {
  const { pathname } = await params;
  if (pathname === "sign-up") redirect("/auth/sign-in");
  return <LoginForm mode="sign-in" />;
}
