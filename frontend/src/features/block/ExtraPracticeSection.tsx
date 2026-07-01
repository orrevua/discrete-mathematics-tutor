import type { GeneratedQuestion } from "@/lib/types";
import QuestionCard, { type Feedback } from "@/components/ui/QuestionCard";

interface ExtraPracticeSectionProps {
  history: Array<{ question: GeneratedQuestion; feedback: Feedback }>;
  question: GeneratedQuestion | null;
  feedback: Feedback | null;
  selected: number | null;
  loading: boolean;
  expanded: boolean;
  onGenerate: () => void;
  onVerify: () => void;
  onSelect: (opt: number) => void;
  onToggleExpanded: (expanded: boolean) => void;
}

export default function ExtraPracticeSection({
  history,
  question,
  feedback,
  selected,
  loading,
  expanded,
  onGenerate,
  onVerify,
  onSelect,
  onToggleExpanded,
}: ExtraPracticeSectionProps) {
  return (
    <>
      <h3 style={{ marginBottom: 8 }}>Praticar mais</h3>
      <p className="practice-intro">Gere questões extras para melhorar seu domínio neste conceito.</p>

      {history.length > 0 && !expanded && (
        <button
          type="button"
          onClick={() => onToggleExpanded(true)}
          className="extra-history-balloon"
        >
          <span style={{ fontSize: "1.1rem" }}>
            {history.filter(h => h.feedback.selected_index === h.feedback.correct_index).length}/{history.length}
          </span>
          <span style={{ fontSize: "0.8rem" }}>questões extras</span>
          <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>ver todas ▸</span>
        </button>
      )}

      {history.length > 0 && expanded && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span className="muted" style={{ fontSize: "0.85rem" }}>
              Histórico: {history.filter(h => h.feedback.selected_index === h.feedback.correct_index).length}/{history.length} corretas
            </span>
            <button
              type="button"
              onClick={() => onToggleExpanded(false)}
              className="btn secondary"
              style={{ padding: "4px 12px", fontSize: "0.8rem" }}
            >
              Recolher ✕
            </button>
          </div>
          {history.map((h, idx) => (
            <div key={h.question.id} style={{ marginBottom: 16, opacity: 0.85 }}>
              <QuestionCard
                question={h.question}
                index={idx}
                selected={h.feedback.selected_index}
                onSelect={() => {}}
                feedback={h.feedback}
              />
            </div>
          ))}
        </div>
      )}

      {loading && (
        <p className="muted">Gerando questão…</p>
      )}

      {question && !loading && (
        <div style={{ marginBottom: 16 }}>
          <QuestionCard
            question={question}
            index={history.length}
            selected={selected}
            onSelect={(opt) => onSelect(opt)}
            feedback={feedback}
          />
          {!feedback ? (
            <button
              className="btn secondary"
              onClick={onVerify}
              disabled={selected === null}
              type="button"
              style={{ marginTop: 8 }}
            >
              Verificar resposta
            </button>
          ) : null}
        </div>
      )}

      {(!loading && (!question || feedback)) && (
        <button
          className="btn light-primary"
          onClick={onGenerate}
          disabled={loading}
          type="button"
        >
          {question ? "Gerar outra questão" : "Praticar mais"}
        </button>
      )}
    </>
  );
}
