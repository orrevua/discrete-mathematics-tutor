"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { api } from "@/lib/api/client";
import { ROUTES } from "@/lib/constants";
import type { AnswerResult, AnswersResponse, Block, PreviousAnswers } from "@/lib/types";
import QuestionCard, { type Feedback } from "@/components/ui/QuestionCard";
import BlockResult from "./BlockResult";
import TutorChat from "./TutorChat";

export default function BlockPage({ blockId }: { blockId: string }) {
  const router = useRouter();
  const [block, setBlock] = useState<Block | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tutorOpen, setTutorOpen] = useState(false);
  const [tutorEnabled, setTutorEnabled] = useState(false);

  // graded (mastery) state
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<AnswersResponse | null>(null);
  const [nextBlockId, setNextBlockId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // practice (study) state
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, number>>({});
  const [practiceResults, setPracticeResults] = useState<AnswerResult[] | null>(null);
  const [practicing, setPracticing] = useState(false);

  useEffect(() => {
    setBlock(null);
    setError(null);
    setAnswers({});
    setResult(null);
    setNextBlockId(null);
    setPracticeAnswers({});
    setPracticeResults(null);
    setTutorOpen(false);
    api
      .getBlock(blockId)
      .then((b) => {
        setBlock(b);
        api.getPreviousAnswers(blockId).then((prev) => {
          if (prev.graded.length > 0) {
            const restored: Record<string, number> = {};
            for (const r of prev.graded) restored[r.question_id] = r.selected_index;
            setAnswers(restored);
            setResult({ results: prev.graded, updated_concepts: [], global_percent: 0 });
          }
          if (prev.practice.length > 0) {
            const restored: Record<string, number> = {};
            for (const r of prev.practice) restored[r.question_id] = r.selected_index;
            setPracticeAnswers(restored);
            setPracticeResults(prev.practice);
          }
        }).catch(() => {});
      })
      .catch(() => setError("Bloco não encontrado."));
  }, [blockId]);

  useEffect(() => {
    api
      .getState()
      .then((s) => setTutorEnabled(s.tutor_enabled))
      .catch(() => setTutorEnabled(false));
  }, []);

  if (error) return <div className="loading">{error}</div>;
  if (!block) return <div className="loading">Carregando bloco…</div>;

  const allAnswered = block.questions.every((q) => answers[q.id] !== undefined);
  const allPracticeAnswered =
    block.practice.length > 0 && block.practice.every((q) => practiceAnswers[q.id] !== undefined);

  function feedbackFrom(results: AnswerResult[] | undefined, questionId: string): Feedback | null {
    const r = results?.find((x) => x.question_id === questionId);
    return r
      ? { correct_index: r.correct_index, selected_index: r.selected_index, solution: r.solution }
      : null;
  }

  async function confirm() {
    setSubmitting(true);
    const payload = block!.questions.map((q) => ({ question_id: q.id, selected_index: answers[q.id] }));
    try {
      const res = await api.submitBlockAnswers(block!.id, payload);
      setResult(res);
      const rec = await api.getRecommendation();
      setNextBlockId(rec.next_block_id);
    } catch {
      setError("Erro ao enviar respostas.");
    } finally {
      setSubmitting(false);
    }
  }

  async function checkPractice() {
    setPracticing(true);
    const payload = block!.practice
      .filter((q) => practiceAnswers[q.id] !== undefined)
      .map((q) => ({ question_id: q.id, selected_index: practiceAnswers[q.id] }));
    try {
      const res = await api.submitPractice(block!.id, payload);
      setPracticeResults(res.results);
    } catch {
      setError("Erro ao verificar a prática.");
    } finally {
      setPracticing(false);
    }
  }

  return (
    <div className={tutorOpen ? "block-layout" : undefined}>
      {tutorOpen && (
        <TutorChat
          conceptId={block.id}
          title={block.title}
          enabled={tutorEnabled}
          onClose={() => setTutorOpen(false)}
        />
      )}
      <div className="block-main">
        <Link href={ROUTES.graph} className="muted">
          ← Mapa de conhecimento
        </Link>
        <div className="row" style={{ justifyContent: "space-between", marginTop: 10 }}>
          <h1 style={{ margin: 0 }}>{block.title}</h1>
          {!tutorOpen && (
            <button className="btn secondary" onClick={() => setTutorOpen(true)} type="button">
              💬 Estudar este tópico com o tutor
            </button>
          )}
        </div>

        <div className="spacer" />
        <div className="card markdown">
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{block.content}</ReactMarkdown>
        </div>

      <div className="spacer" />
      <h2>Questões avaliadas</h2>
      <p className="practice-intro">Estas questões medem seu domínio do conceito.</p>
      <div className="card">
        {block.questions.map((q, i) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={i}
            selected={answers[q.id] ?? null}
            onSelect={(opt) => setAnswers((a) => ({ ...a, [q.id]: opt }))}
            feedback={feedbackFrom(result?.results, q.id)}
          />
        ))}

        {!result ? (
          <button className="btn" onClick={confirm} disabled={!allAnswered || submitting} type="button">
            {submitting ? "Enviando…" : "Confirmar respostas"}
          </button>
        ) : (
          <BlockResult
            result={result}
            nextBlockId={nextBlockId}
            onNext={(id) => router.push(ROUTES.block(id))}
          />
        )}
      </div>

      {block.practice.length > 0 && (
        <>
          <div className="spacer" />
          <h2>Exercícios de prática</h2>
          <p className="practice-intro">
            Resolva primeiro — a resolução passo a passo aparece só depois que você responde. Não
            afetam seu domínio.
          </p>
          <div className="card">
            {block.practice.map((q, i) => (
              <QuestionCard
                key={q.id}
                question={q}
                index={i}
                selected={practiceAnswers[q.id] ?? null}
                onSelect={(opt) => setPracticeAnswers((a) => ({ ...a, [q.id]: opt }))}
                feedback={feedbackFrom(practiceResults ?? undefined, q.id)}
              />
            ))}
            {!practiceResults && (
              <button
                className="btn secondary"
                onClick={checkPractice}
                disabled={!allPracticeAnswered || practicing}
                type="button"
              >
                {practicing ? "Verificando…" : "Verificar e ver resoluções"}
              </button>
            )}
          </div>
        </>
      )}
      </div>
    </div>
  );
}
