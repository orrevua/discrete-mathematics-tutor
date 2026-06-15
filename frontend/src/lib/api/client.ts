import type {
  AnswerInput,
  AnswersResponse,
  Block,
  Diagnostic,
  DiagnosticSubmitResponse,
  Graph,
  MasteryState,
  PracticeResponse,
  PreviousAnswers,
  Recommendation,
  State,
  TutorMessage,
} from "@/lib/types";

const BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000/api";

// The auth layer registers a getter so requests carry the Stack access token.
// Kept as a module singleton so the (non-React) api client can stay simple.
let tokenProvider: (() => Promise<string | null>) | null = null;

export function setTokenProvider(fn: (() => Promise<string | null>) | null): void {
  tokenProvider = fn;
}

async function authHeaders(): Promise<Record<string, string>> {
  if (!tokenProvider) return {};
  try {
    const token = await tokenProvider();
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

// If the backend requires auth and we're not signed in, send the user to login.
function handleUnauthorized(status: number): void {
  if (status === 401 && typeof window !== "undefined") {
    if (window.location.pathname.startsWith("/auth")) return;
    window.location.href = "/auth/sign-in";
  }
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    cache: "no-store",
    headers: await authHeaders(),
  });
  if (!res.ok) {
    handleUnauthorized(res.status);
    throw new Error(`GET ${path} → ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    handleUnauthorized(res.status);
    throw new Error(`POST ${path} → ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getState: () => get<State>("/state"),
  resetProgress: () => post<State>("/reset", {}),
  getGraph: () => get<Graph>("/graph"),
  getMastery: () => get<MasteryState>("/mastery"),
  getRecommendation: () => get<Recommendation>("/recommendation"),
  getBlock: (id: string) => get<Block>(`/blocks/${id}`),
  getPreviousAnswers: (id: string) => get<PreviousAnswers>(`/blocks/${id}/answers`),
  submitBlockAnswers: (id: string, answers: AnswerInput[]) =>
    post<AnswersResponse>(`/blocks/${id}/answers`, { answers }),
  submitPractice: (id: string, answers: AnswerInput[]) =>
    post<PracticeResponse>(`/blocks/${id}/practice`, { answers }),
  getDiagnostic: () => get<Diagnostic>("/diagnostic"),
  submitDiagnostic: (answers: AnswerInput[]) =>
    post<DiagnosticSubmitResponse>("/diagnostic/submit", { answers }),
  // Surfaces the server's detail message (e.g. "tutor não configurado").
  tutor: async (id: string, messages: TutorMessage[]): Promise<{ reply: string }> => {
    const res = await fetch(`${BASE}/blocks/${id}/tutor`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify({ messages }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || `Erro ${res.status}`);
    return data as { reply: string };
  },
};
