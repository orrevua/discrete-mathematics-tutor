"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export default function LoginForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const isSignUp = mode === "sign-up";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const supabase = getSupabase();
      const { error: authError } = isSignUp
        ? await supabase.auth.signUp({ email, password, options: { data: { name } } })
        : await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        console.error("Supabase auth error:", authError);
        setError(authError.message);
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Algo deu errado. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card auth-form" onSubmit={onSubmit}>
      <h1 className="auth-title">{isSignUp ? "Criar conta" : "Entrar"}</h1>
      <p className="auth-subtitle">
        {isSignUp
          ? "Crie sua conta para acompanhar seu progresso."
          : "Entre para continuar seus estudos."}
      </p>

      {isSignUp && (
        <label className="auth-field">
          <span>Nome</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
            required
            autoComplete="name"
          />
        </label>
      )}

      <label className="auth-field">
        <span>E-mail</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          required
          autoComplete="email"
        />
      </label>

      <label className="auth-field">
        <span>Senha</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Sua senha"
          required
          minLength={8}
          autoComplete={isSignUp ? "new-password" : "current-password"}
        />
      </label>

      {error && <div className="auth-error">{error}</div>}

      <button className="btn auth-submit" type="submit" disabled={busy}>
        {busy ? "Aguarde…" : isSignUp ? "Criar conta" : "Entrar"}
      </button>

      <p className="auth-switch">
        {isSignUp ? (
          <>
            Já tem uma conta? <Link href="/auth/sign-in">Entrar</Link>
          </>
        ) : (
          <>
            Não tem uma conta? <Link href="/auth/sign-up">Criar conta</Link>
          </>
        )}
      </p>
    </form>
  );
}
