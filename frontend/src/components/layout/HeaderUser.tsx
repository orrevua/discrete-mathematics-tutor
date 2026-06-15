"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";

export default function HeaderUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <span className="user-name" style={{ opacity: 0.5 }}>…</span>;
  }

  if (!user) {
    return (
      <Link href="/auth/sign-in" className="btn secondary header-auth-btn">
        Entrar
      </Link>
    );
  }

  async function handleSignOut() {
    await getSupabase().auth.signOut();
    window.location.href = "/auth/sign-in";
  }

  return (
    <div className="user-menu">
      <span className="user-name">
        {user.user_metadata?.name ?? user.email}
      </span>
      <button className="link-btn" onClick={handleSignOut} type="button">
        Sair
      </button>
    </div>
  );
}
