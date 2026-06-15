import type { ReactNode } from "react";
import Link from "next/link";
import AuthBackground from "@/components/auth/AuthBackground";

// Full-screen, centered login layout with a subject-themed background.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-screen">
      <AuthBackground />
      <div className="auth-content">
        <Link href="/" className="auth-brand">
          🧠 Tutor Inteligente · <span>FMC2</span>
        </Link>
        <div className="auth-card-wrap">{children}</div>
        <p className="auth-tagline">Fundamentos Matemáticos da Computação</p>
      </div>
    </div>
  );
}
