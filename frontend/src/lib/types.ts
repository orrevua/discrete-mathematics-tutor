export type Level = "Iniciante" | "Em progresso" | "Dominado";

export interface State {
  diagnostic_done: boolean;
  concept_count: number;
  tutor_enabled: boolean;
}

export interface TutorMessage {
  role: "user" | "assistant";
  content: string;
}

export interface GraphNode {
  id: string;
  title: string;
  unit: number;
  topic: number;
  prerequisites: string[];
}

export interface GraphEdge {
  from: string;
  to: string;
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface MasteryItem {
  id: string;
  mastery: number;
  level: Level;
  percent: number;
  unlocked: boolean;
}

export interface MasteryState {
  concepts: MasteryItem[];
  global_percent: number;
}

export interface PublicQuestion {
  id: string;
  stem: string;
  options: string[];
}

export interface Block {
  id: string;
  title: string;
  unit: number;
  topic: number;
  content: string;
  questions: PublicQuestion[];
  practice: PublicQuestion[];
}

export interface AnswerResult {
  question_id: string;
  correct: boolean;
  correct_index: number;
  selected_index: number;
  solution: string;
}

export interface PracticeResponse {
  results: AnswerResult[];
}

export interface UpdatedConcept {
  id: string;
  mastery: number;
  level: Level;
  percent: number;
}

export interface AnswersResponse {
  results: AnswerResult[];
  updated_concepts: UpdatedConcept[];
  global_percent: number;
}

export interface PreviousAnswers {
  graded: AnswerResult[];
  practice: AnswerResult[];
}

export interface Diagnostic {
  questions: PublicQuestion[];
}

export interface Recommendation {
  next_block_id: string | null;
  reason: string;
}

export interface AnswerInput {
  question_id: string;
  selected_index: number;
}

export interface DiagnosticSubmitResponse {
  diagnostic_done: boolean;
  mastery: MasteryState;
}
