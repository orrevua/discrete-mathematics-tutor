/** Static, presentation-only content for the /sobre page.
 *  Numbers and facts are derived from the codebase and the project proposal
 *  (docs/pre-projeto-its.pdf) — do not invent beyond what is verified. */

export const STATS = [
  { num: "17", lbl: "conceitos no grafo" },
  { num: "3", lbl: "unidades + transversal" },
  { num: "10", lbl: "questões de diagnóstico" },
  { num: "0.6", lbl: "gate de pré-requisito" },
];

export const MODELS = [
  {
    badge: "Modelo do Domínio",
    badgeClass: "progresso",
    title: "Grafo de conhecimento",
    mech: "17 conceitos ligados por pré-requisitos formam um DAG. Cada bloco só é liberado quando os pré-requisitos estão dominados.",
    ref: "recommendation.compute_unlocked_set",
  },
  {
    badge: "Modelo do Aluno",
    badgeClass: "dominado",
    title: "Domínio por EWMA",
    mech: "Cada conceito tem um domínio m ∈ [0,1] atualizado por uma média móvel exponencial explicável a cada resposta.",
    ref: "domain/mastery.py",
  },
  {
    badge: "Modelo Pedagógico",
    badgeClass: "iniciante",
    title: "Intervenção adaptativa",
    mech: "Gate ≥ 0,6 em todos os pré-requisitos; entre os liberados e não dominados, recomenda o de menor domínio.",
    ref: "domain/recommendation.py",
  },
];

/** "Responde a eventos de desempenho (reforço positivo no acerto, incentivo
 *  construtivo no erro)" — do pré-projeto. Verificado no código: feedback
 *  imediato por cor/texto, resolução passo a passo e o mascote Pi, que reage
 *  ao desempenho (não gera texto de encorajamento, mas muda de humor). */
export const FEEDBACK = [
  {
    badge: "No acerto",
    badgeClass: "dominado",
    title: "Reforço positivo",
    mech: "Feedback imediato \"✓ Correto!\" com a opção certa destacada em verde. Em questões difíceis ou ao dominar um conceito, o mascote Pi comemora.",
    ref: "QuestionCard.tsx · usePiMood.ts",
  },
  {
    badge: "No erro",
    badgeClass: "iniciante",
    title: "Incentivo construtivo",
    mech: "A resposta certa é revelada sem punição — Pi fica \"preocupado\", não frustrado — convidando o aluno a entender onde errou, em vez de apenas marcar como errado.",
    ref: "QuestionCard.tsx · usePiMood.ts",
  },
  {
    badge: "Sempre",
    badgeClass: "progresso",
    title: "Exemplos resolvidos",
    mech: "Uma resolução passo a passo (com fórmulas em KaTeX) só é revelada depois que o aluno responde, consolidando o aprendizado com ou sem acerto.",
    ref: "domain/models.py · Question.solution",
  },
];

export const FEEDBACK_NOTE =
  "Honestidade de projeto: o reforço é majoritariamente visual/afetivo (cor, humor do mascote, resolução) — o sistema não gera frases de encorajamento por IA a cada resposta. O mascote Pi também reage ao desengajamento (trocar de aba, abandonar o bloco), ficando \"incomodado\".";

export const PIPELINE = [
  { label: "Next.js", desc: "Cliente React (App Router, RSC)" },
  { label: "FastAPI", desc: "Hexagonal: rotas → TutoringService → domínio" },
  { label: "Persistência", desc: "SQLite (dev) · Postgres/Neon (prod)" },
  { label: "Gemini LLM", desc: "Tutor + geração via API OpenAI-compatible" },
];

export const TECH_GROUPS = [
  {
    group: "Frontend",
    items: [
      { name: "Next.js 16", role: "App Router, React Server Components" },
      { name: "React 19", role: "Camada de interface" },
      { name: "TypeScript 5.7", role: "Tipagem estática" },
      { name: "@supabase/ssr", role: "Sessão de autenticação no cliente" },
      { name: "framer-motion 12", role: "Animações de entrada" },
      { name: "KaTeX", role: "Fórmulas via react-markdown + remark-math" },
      { name: "CSS global", role: "Design system próprio, sem framework" },
    ],
  },
  {
    group: "Backend",
    items: [
      { name: "FastAPI", role: "API HTTP" },
      { name: "Pydantic 2", role: "Validação e schemas" },
      { name: "Uvicorn", role: "Servidor ASGI" },
      { name: "PyJWT", role: "Verifica JWT do Supabase via JWKS" },
      { name: "Hexagonal", role: "Ports & adapters (domínio puro)" },
    ],
  },
  {
    group: "IA",
    items: [
      { name: "Google Gemini", role: "gemini-2.5-flash-lite (tutor + questões)" },
      { name: "API OpenAI-compatible", role: "Via urllib da stdlib, sem SDK" },
      { name: "Tutor Socrático", role: "Prompt travado no tópico do bloco" },
      { name: "Geração dinâmica", role: "Questões com anti-repetição" },
    ],
  },
  {
    group: "Infra",
    items: [
      { name: "Neon", role: "PostgreSQL gerenciado em produção" },
      { name: "SQLite", role: "Banco local para desenvolvimento" },
      { name: "Supabase Auth", role: "JWT via JWKS (fallback dev-user)" },
    ],
  },
];

export const LEVELS = [
  { badge: "Iniciante", cls: "iniciante", range: "m < 0,4" },
  { badge: "Em progresso", cls: "progresso", range: "0,4 ≤ m < 0,75" },
  { badge: "Dominado", cls: "dominado", range: "m ≥ 0,75" },
];

/** From docs/pre-projeto-its.pdf (author-supplied, resolved Open Question 1). */
export const PROPOSAL = [
  {
    title: "Contexto",
    body: "Pré-projeto da disciplina IAED (Prof. Adelson de Araújo), Unidade 3: um tutor inteligente adaptativo para Fundamentos Matemáticos da Computação (FMC2).",
  },
  {
    title: "Equipe",
    body: "Felipe — Modelo do Domínio (grafo de conceitos, conteúdo, integração do sistema). Cassio — Modelo do Aluno e Modelo Pedagógico (rastreamento, recomendação e feedback). Silas — interface e diálogo (tela do aluno, mapa de conhecimento, tutor por chat). Escopo, redação, questões, testes com usuários e apresentação foram compartilhados.",
  },
  {
    title: "Por que FMC2",
    body: "Matéria abstrata em que muitos alunos têm dificuldade e com ordem natural de dependência entre os conceitos — terreno ideal para um tutor adaptativo.",
  },
  {
    title: "Representação do domínio",
    body: "Rede semântica / grafo de pré-requisitos (um DAG), garantindo ordem de estudo válida. ~37 conceitos em 4 partes: Conteúdo Transversal (demonstrações, indução) → Unidade 1 (conjuntos e funções) → Unidade 2 (relações) → Unidade 3 (álgebra: Hasse, isomorfismo, reticulados, booleana). Cada conceito traz texto explicativo, 3 questões avaliativas e questões extras de prática.",
  },
  {
    title: "Modelo do aluno",
    body: "Valor entre 0 e 1 por conceito, estimando P(domínio | interações). Inspirado em Bayesian Knowledge Tracing: domínio_novo = 0,7 × domínio_atual + 0,3 × recompensa, com recompensa = 0,5 ± 0,5 × dificuldade. O diagnóstico inicial define o ponto de partida (base neutra 0,5). Regra booleana de pré-requisitos: um conceito só libera quando todos têm domínio ≥ 0,6.",
  },
  {
    title: "Inspirações teóricas",
    body: "Arquitetura ITS em três componentes (VanLehn, 2006); grafo de pré-requisitos; Bayesian Knowledge Tracing (Corbett & Anderson, 1994); lógica booleana SE-ENTÃO no modelo pedagógico; Mastery Learning (Bloom, 1968); Zona de Desenvolvimento Proximal (Vygotsky); feedback imediato com exemplos resolvidos; PLN para manter o tutor por chat restrito ao tópico.",
  },
];

export const PROPOSAL_NOTE =
  "Honestidade de projeto: o pré-projeto propunha inspiração em Bayesian Knowledge Tracing; a implementação final usa EWMA (m' = 0,7·m + 0,3·recompensa) — uma simplificação totalmente explicável do mesmo espírito (atualização ponderada, sem saltos bruscos), e não uma rede bayesiana completa.";

/** Milestones drawn from docs/HANDOFF.md "Work Completed". */
export const ROADMAP = [
  { title: "Curso completo", desc: "17 blocos com texto explicativo, questões e mapa de conhecimento." },
  { title: "Modelo do aluno", desc: "Domínio por EWMA e liberação por pré-requisitos." },
  { title: "Diagnóstico inicial", desc: "Pré-teste de 10 questões semeando os priors de domínio." },
  { title: "Tutor por IA", desc: "Chat Socrático travado no tópico do bloco." },
  { title: "Geração de questões", desc: "Banco dinâmico com anti-repetição via LLM." },
  { title: "Multiusuário", desc: "Autenticação Supabase (JWT via JWKS)." },
  { title: "Deploy", desc: "Vercel + backend + Postgres/Neon (planejado)." },
];
