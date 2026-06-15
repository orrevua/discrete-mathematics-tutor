"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { ROUTES } from "@/lib/constants";
import type { PublicQuestion } from "@/lib/types";
import QuestionCard from "@/components/ui/QuestionCard";
import ProgressBar from "@/components/ui/ProgressBar";

export default function DiagnosticPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .getDiagnostic()
      .then((d) => setQuestions(d.questions))
      .catch(() => setError(true));
  }, []);

  if (error) return <div className="loading">Erro ao carregar o diagnóstico.</div>;
  if (questions.length === 0) return <div className="loading">Carregando diagnóstico…</div>;

  const question = questions[current];
  const isLast = current === questions.length - 1;
  const selected = answers[question.id] ?? null;

  function choose(optionIndex: number) {
    setAnswers((prev) => ({ ...prev, [question.id]: optionIndex }));
  }

  function goNext() {
    if (!isLast) setCurrent((c) => c + 1);
  }

  function skip() {
    // Skipped questions are simply not submitted (no mastery effect).
    if (isLast) finish();
    else goNext();
  }

  async function finish() {
    setSubmitting(true);
    const payload = Object.entries(answers).map(([question_id, selected_index]) => ({
      question_id,
      selected_index,
    }));
    try {
      await api.submitDiagnostic(payload);
      router.push(ROUTES.graph);
    } catch {
      setError(true);
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1>Diagnóstico inicial</h1>
      <p className="subtitle">
        Vamos mapear seu ponto de partida. Pergunta {current + 1} de {questions.length}.
      </p>
      <ProgressBar percent={((current + 1) / questions.length) * 100} />
      <div className="spacer" />

      <div className="card">
        <QuestionCard question={question} index={current} selected={selected} onSelect={choose} />
        <div className="row" style={{ justifyContent: "space-between", marginTop: 12 }}>
          <button className="btn secondary" onClick={skip} disabled={submitting} type="button">
            Pular
          </button>
          {isLast ? (
            <button
              className="btn"
              onClick={finish}
              disabled={selected === null || submitting}
              type="button"
            >
              {submitting ? "Enviando…" : "Concluir diagnóstico"}
            </button>
          ) : (
            <button className="btn" onClick={goNext} disabled={selected === null} type="button">
              Próxima →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
