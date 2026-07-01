import type { Level } from "./types";

/** Unit names (pt-BR), mirroring the real course structure. */
export const UNIT_NAMES: Record<number, string> = {
  0: "Conteúdo Transversal",
  1: "Unidade 1 — Conjuntos e Funções",
  2: "Unidade 2 — Relações",
  3: "Unidade 3 — Elementos de Álgebra",
};

/** Topic names (pt-BR) — finer grouping used as columns in the knowledge map. */
export const TOPIC_NAMES: Record<number, string> = {
  1: "Demonstrações",
  2: "Indução",
  3: "Conjuntos",
  4: "Funções",
  5: "Sequências e Somatório",
  6: "Cardinalidade",
  7: "Relações",
  8: "Ordem e Equivalência",
  9: "Hasse e Ordens",
  10: "Reticulados e Booleana",
};

/** Maps a mastery level to its CSS modifier class. */
export const LEVEL_CLASS: Record<Level, string> = {
  Iniciante: "iniciante",
  "Em progresso": "progresso",
  Dominado: "dominado",
};

/** Route paths in one place so links never drift. */
export const ROUTES = {
  dashboard: "/",
  diagnostic: "/diagnostic",
  graph: "/graph",
  about: "/sobre",
  block: (id: string) => `/block/${id}`,
} as const;
