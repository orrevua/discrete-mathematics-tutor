"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { getAccessToken } from "@/lib/auth/client";
import { setTokenProvider } from "@/lib/api/client";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTokenProvider(getAccessToken);

    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data }) => {
      console.log("[Providers] initial session:", data.session ? "exists" : "null");
      setReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[Providers] auth state change:", event, session ? "has session" : "no session");
      setReady(true);
      if (event === "SIGNED_OUT" && typeof window !== "undefined" && !window.location.pathname.startsWith("/auth")) {
        window.location.href = "/auth/sign-in";
      }
    });

    return () => {
      setTokenProvider(null);
      subscription.unsubscribe();
    };
  }, []);

  if (!ready) return null;

  return <>{children}</>;
}
