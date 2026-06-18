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
import type { AnswerResult, AnswersResponse, Block, GeneratedQuestion } from "@/lib/types";
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
  const [nextReason, setNextReason] = useState<string>("");
  const [submittingGraded, setSubmittingGraded] = useState(false);

  // generated question state
  const [generatingQuestion, setGeneratingQuestion] = useState<string | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<Record<string, GeneratedQuestion>>({});
  const [generatedFeedback, setGeneratedFeedback] = useState<Record<string, Feedback>>({});
  const [expandedOriginals, setExpandedOriginals] = useState<Record<string, boolean>>({});

  // practice (study) state
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, number>>({});
  const [practiceResults, setPracticeResults] = useState<AnswerResult[] | null>(null);
  const [practicing, setPracticing] = useState(false);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    setBlock(null);
    setError(null);
    setLocked(false);
    setAnswers({});
    setResult(null);
    setNextBlockId(null);
    setNextReason("");
    setPracticeAnswers({});
    setPracticeResults(null);
    setGeneratedQuestions({});
    setGeneratedFeedback({});
    setExpandedOriginals({});
    setTutorOpen(false);
    api
      .getBlock(blockId)
      .then((b) => {
        setBlock(b);
        api.getMastery().then((m) => {
          const concept = m.concepts.find((c) => c.id === blockId);
          if (concept && !concept.unlocked) {
            setLocked(true);
            return;
          }
        }).catch(() => {});
        api.getPreviousAnswers(blockId).then((prev) => {
          if (prev.graded.length > 0) {
            const restored: Record<string, number> = {};
            for (const r of prev.graded) restored[r.question_id] = r.selected_index;
            setAnswers(restored);
            setResult({ results: prev.graded, updated_concepts: [], global_percent: 0 });
            api.getRecommendation().then((rec) => {
              setNextBlockId(rec.next_block_id);
              setNextReason(rec.reason);
            }).catch(() => {});
          }
          if (prev.practice.length > 0) {
            const restored: Record<string, number> = {};
            for (const r of prev.practice) restored[r.question_id] = r.selected_index;
            setPracticeAnswers(restored);
            setPracticeResults(prev.practice);
          }
          if (prev.generated && prev.generated.length > 0) {
            const restoredGen: Record<string, GeneratedQuestion> = {};
            const restoredFb: Record<string, Feedback> = {};
            const restoredAns: Record<string, number> = {};
            for (const g of prev.generated) {
              restoredGen[g.original_question_id] = {
                id: g.question_id,
                stem: g.stem,
                options: g.options,
                correct_index: g.correct_index,
                solution: g.solution,
                difficulty: g.difficulty,
              };
              if (g.selected_index !== null && g.correct !== null) {
                restoredAns[g.question_id] = g.selected_index;
                restoredFb[g.question_id] = {
                  correct_index: g.correct_index,
                  selected_index: g.selected_index,
                  solution: g.solution,
                };
              }
            }
            setGeneratedQuestions(restoredGen);
            setGeneratedFeedback(restoredFb);
            setAnswers((prev) => ({ ...prev, ...restoredAns }));
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
  if (locked) return (
    <div className="loading">
      <p>🔒 Este conceito ainda não foi desbloqueado.</p>
      <p className="muted">Domine os pré-requisitos para acessá-lo.</p>
      <Link href={ROUTES.graph} className="btn secondary" style={{ marginTop: 16 }}>
        ← Ver mapa de conhecimento
      </Link>
    </div>
  );
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
    setSubmittingGraded(true);
    const payload = block!.questions.map((q) => ({
      question_id: q.id,
      selected_index: answers[q.id],
    }));
    try {
      const res = await api.submitBlockAnswers(block!.id, payload);
      setResult(res);
      const rec = await api.getRecommendation();
      setNextBlockId(rec.next_block_id);
      setNextReason(rec.reason);
    } catch {
      setError("Erro ao enviar respostas.");
    } finally {
      setSubmittingGraded(false);
    }
  }

  async function handleGenerateQuestion(
    originalQuestionId: string,
    incorrectAnswerIndex: number | null,
  ) {
    if (!block) return;
    setGeneratingQuestion(originalQuestionId);
    try {
      const incorrectAnswerText = incorrectAnswerIndex !== null
        ? (block.questions.find(q => q.id === originalQuestionId)?.options[incorrectAnswerIndex]
           ?? generatedQuestions[originalQuestionId]?.options[incorrectAnswerIndex])
        : null;

      const previousStems = Object.values(generatedQuestions).map(q => q.stem);
      const newQ = await api.generateQuestion(
        block.id,
        originalQuestionId,
        incorrectAnswerText ?? undefined,
        previousStems,
      );
      setGeneratedQuestions((prev) => ({ ...prev, [originalQuestionId]: newQ }));
      // Clear previous generated answer and feedback for this slot
      setAnswers((prev) => {
        const next = { ...prev };
        const oldGenQ = generatedQuestions[originalQuestionId];
        if (oldGenQ) delete next[oldGenQ.id];
        return next;
      });
      setGeneratedFeedback((prev) => {
        const next = { ...prev };
        const oldGenQ = generatedQuestions[originalQuestionId];
        if (oldGenQ) delete next[oldGenQ.id];
        return next;
      });
    } catch (err: any) {
      setError(`Erro ao gerar nova questão: ${err.message}`);
    } finally {
      setGeneratingQuestion(null);
    }
  }

  async function verifyGeneratedAnswer(genQ: GeneratedQuestion, originalQuestionId: string) {
    const selectedIndex = answers[genQ.id];
    if (selectedIndex === undefined || !block) return;
    const correct = selectedIndex === genQ.correct_index;
    setGeneratedFeedback((prev) => ({
      ...prev,
      [genQ.id]: {
        correct_index: genQ.correct_index,
        selected_index: selectedIndex,
        solution: genQ.solution,
      },
    }));
    try {
      const updated = await api.recordGeneratedAnswer(
        block.id, genQ.id, originalQuestionId, correct, selectedIndex, genQ,
      );
      setResult((prev) => prev ? { ...prev, global_percent: updated.global_percent } : prev);
      const rec = await api.getRecommendation();
      setNextBlockId(rec.next_block_id);
      setNextReason(rec.reason);
    } catch {
      // Mastery update failed silently — feedback still shows
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
        {block.questions.map((q, i) => {
          const originalQuestionId = q.id;
          const genQ = generatedQuestions[originalQuestionId];
          const isGenerating = generatingQuestion === originalQuestionId;
          const originalFeedback = feedbackFrom(result?.results, originalQuestionId);
          const originalIsIncorrect = originalFeedback
            ? originalFeedback.selected_index !== originalFeedback.correct_index
            : false;
          const isOriginalExpanded = expandedOriginals[originalQuestionId] ?? false;

          return (
            <div key={originalQuestionId} style={{ marginBottom: "24px" }}>
              {genQ ? (
                <>
                  {/* Original question collapsed into expandable balloon */}
                  <div style={{
                    background: "var(--bg-muted, #f5f1ec)",
                    border: "1px solid var(--border, #e0d6cb)",
                    borderRadius: "8px",
                    marginBottom: "12px",
                    overflow: "hidden",
                  }}>
                    <button
                      type="button"
                      onClick={() => setExpandedOriginals((prev) => ({ ...prev, [originalQuestionId]: !isOriginalExpanded }))}
                      style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 14px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        color: "var(--text-muted, #8a7e72)",
                      }}
                      aria-expanded={isOriginalExpanded}
                      aria-label={`${isOriginalExpanded ? "Fechar" : "Ver"} questão original ${i + 1}`}
                    >
                      <span>Questão original {i + 1} — você errou esta</span>
                      <span style={{ fontSize: "1.1rem" }}>{isOriginalExpanded ? "✕" : "▸"}</span>
                    </button>
                    {isOriginalExpanded && (
                      <div style={{ padding: "0 14px 14px" }}>
                        <QuestionCard
                          question={q}
                          index={i}
                          selected={answers[q.id] ?? null}
                          onSelect={() => {}}
                          feedback={originalFeedback}
                        />
                      </div>
                    )}
                  </div>

                  {/* Generated question takes the original's place */}
                  <div aria-live="polite">
                    <p className="practice-intro" style={{ marginBottom: "8px" }}>
                      <strong>Questão de reforço {i + 1}</strong> — acerte para melhorar seu domínio
                    </p>
                    <QuestionCard
                      question={genQ}
                      index={i}
                      selected={answers[genQ.id] ?? null}
                      onSelect={(opt) => setAnswers((a) => ({ ...a, [genQ.id]: opt }))}
                      feedback={generatedFeedback[genQ.id] ?? null}
                    />
                    {!generatedFeedback[genQ.id] ? (
                      <button
                        className="btn secondary"
                        onClick={() => verifyGeneratedAnswer(genQ, originalQuestionId)}
                        disabled={answers[genQ.id] === undefined}
                        type="button"
                        style={{ marginTop: "8px" }}
                        aria-label={`Verificar resposta da questão de reforço ${i + 1}`}
                      >
                        Verificar resposta
                      </button>
                    ) : generatedFeedback[genQ.id].selected_index !== generatedFeedback[genQ.id].correct_index ? (
                      <div aria-live="polite" aria-busy={isGenerating}>
                        <button
                          className="btn light-primary"
                          onClick={() => handleGenerateQuestion(originalQuestionId, generatedFeedback[genQ.id].selected_index)}
                          disabled={isGenerating}
                          type="button"
                          style={{ marginTop: "8px" }}
                          aria-label={`Gerar outra questão de reforço para a questão ${i + 1}`}
                        >
                          {isGenerating ? "Gerando…" : "Gerar outra questão"}
                        </button>
                      </div>
                    ) : null}
                  </div>
                </>
              ) : (
                <>
                  {/* Original question in its normal place */}
                  <QuestionCard
                    question={q}
                    index={i}
                    selected={answers[q.id] ?? null}
                    onSelect={(opt) => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                    feedback={originalFeedback}
                  />

                  {/* "Gerar nova questão" button with spacing */}
                  {result && originalIsIncorrect && (
                    <div aria-live="polite" aria-busy={isGenerating} style={{ marginTop: "12px" }}>
                      <button
                        className="btn light-primary"
                        onClick={() => handleGenerateQuestion(originalQuestionId, originalFeedback?.selected_index ?? null)}
                        disabled={isGenerating}
                        type="button"
                        aria-label={`Gerar nova questão para a questão ${i + 1}`}
                      >
                        {isGenerating ? "Gerando…" : "Gerar nova questão sobre este tópico"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}

        {!result ? (
          <button className="btn" onClick={confirm} disabled={!allAnswered || submittingGraded} type="button">
            {submittingGraded ? "Enviando…" : "Confirmar respostas"}
          </button>
        ) : (
          <BlockResult
            result={result}
            currentBlockId={blockId}
            nextBlockId={nextBlockId}
            nextReason={nextReason}
            onNext={(id) => router.push(ROUTES.block(id))}
            generatedCorrect={Object.values(generatedFeedback).filter(fb => fb.selected_index === fb.correct_index).length}
            generatedTotal={Object.values(generatedFeedback).length}
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
