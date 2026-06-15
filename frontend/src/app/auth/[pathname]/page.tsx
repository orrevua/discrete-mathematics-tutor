import LoginForm from "@/components/auth/LoginForm";

// Handles /auth/sign-in and /auth/sign-up with a lean custom form.
export default async function AuthPage({ params }: { params: Promise<{ pathname: string }> }) {
  const { pathname } = await params;
  const mode = pathname === "sign-up" ? "sign-up" : "sign-in";
  return <LoginForm mode={mode} />;
}
