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
import type { AnswerResult, AnswersResponse, Block, GeneratedQuestion, Level } from "@/lib/types";
import QuestionCard, { type Feedback } from "@/components/ui/QuestionCard";
import { PiWidget } from "@/components/pi/PiWidget";
import { usePiMood } from "@/components/pi/usePiMood";
import { useDisengagementDetector } from "@/components/pi/useDisengagementDetector";
import LevelBadge from "@/components/ui/LevelBadge";
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
  const [allGeneratedStems, setAllGeneratedStems] = useState<string[]>([]);

  // extra practice state
  const [extraPracticeQuestion, setExtraPracticeQuestion] = useState<GeneratedQuestion | null>(null);
  const [extraPracticeFeedback, setExtraPracticeFeedback] = useState<Feedback | null>(null);
  const [extraPracticeSelected, setExtraPracticeSelected] = useState<number | null>(null);
  const [extraPracticeLoading, setExtraPracticeLoading] = useState(false);
  const [extraPracticeHistory, setExtraPracticeHistory] = useState<Array<{ question: GeneratedQuestion; feedback: Feedback }>>([]);
  const [extraHistoryExpanded, setExtraHistoryExpanded] = useState(false);

  // practice (study) state
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, number>>({});
  const [practiceResults, setPracticeResults] = useState<AnswerResult[] | null>(null);
  const [practicing, setPracticing] = useState(false);
  const [locked, setLocked] = useState(false);
  const [unlockChecked, setUnlockChecked] = useState(false);

  const { mood, dispatch: piDispatch } = usePiMood();
  useDisengagementDetector(piDispatch, !locked && !!block);

  useEffect(() => {
    setBlock(null);
    setError(null);
    setLocked(false);
    setUnlockChecked(false);
    setAnswers({});
    setResult(null);
    setNextBlockId(null);
    setNextReason("");
    setPracticeAnswers({});
    setPracticeResults(null);
    setGeneratedQuestions({});
    setGeneratedFeedback({});
    setExpandedOriginals({});
    setAllGeneratedStems([]);
    setExtraPracticeQuestion(null);
    setExtraPracticeFeedback(null);
    setExtraPracticeSelected(null);
    setExtraPracticeLoading(false);
    setExtraPracticeHistory([]);
    setTutorOpen(false);
    api
      .getBlock(blockId)
      .then((b) => {
        setBlock(b);
        Promise.all([api.getMastery(), api.getPreviousAnswers(blockId)]).then(([m, prev]) => {
          const concept = m.concepts.find((c) => c.id === blockId);
          if (concept && !concept.unlocked) {
            setLocked(true);
          }
          setUnlockChecked(true);
          if (prev.graded.length > 0) {
            const restored: Record<string, number> = {};
            for (const r of prev.graded) restored[r.question_id] = r.selected_index;
            setAnswers(restored);
            const updatedConcepts = m.concepts
              .filter((c) => c.id === blockId)
              .map((c) => ({ id: c.id, mastery: c.mastery, level: c.level, percent: c.percent }));
            setResult({ results: prev.graded, updated_concepts: updatedConcepts, global_percent: m.global_percent });
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
            const restoredExtra: Array<{ question: GeneratedQuestion; feedback: Feedback }> = [];
            const stems: string[] = [];
            for (const g of prev.generated) {
              const gq: GeneratedQuestion = {
                id: g.question_id,
                stem: g.stem,
                options: g.options,
                correct_index: g.correct_index,
                solution: g.solution,
                difficulty: g.difficulty,
              };
              stems.push(g.stem);
              if (g.original_question_id === "extra-practice") {
                if (g.selected_index !== null && g.correct !== null) {
                  restoredExtra.push({
                    question: gq,
                    feedback: {
                      correct_index: g.correct_index,
                      selected_index: g.selected_index,
                      solution: g.solution,
                    },
                  });
                }
              } else {
                restoredGen[g.original_question_id] = gq;
                if (g.selected_index !== null && g.correct !== null) {
                  restoredAns[g.question_id] = g.selected_index;
                  restoredFb[g.question_id] = {
                    correct_index: g.correct_index,
                    selected_index: g.selected_index,
                    solution: g.solution,
                  };
                }
              }
            }
            setGeneratedQuestions(restoredGen);
            setGeneratedFeedback(restoredFb);
            setAnswers((prev) => ({ ...prev, ...restoredAns }));
            setAllGeneratedStems(stems);
            setExtraPracticeHistory(restoredExtra);
          }
        }).catch(() => setUnlockChecked(true));
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
  if (!block || !unlockChecked) return <div className="loading">Carregando bloco…</div>;
  if (locked) return (
    <div className="loading">
      <p>🔒 Este conceito ainda não foi desbloqueado.</p>
      <p className="muted">Domine os pré-requisitos para acessá-lo.</p>
      <Link href={ROUTES.graph} className="btn secondary" style={{ marginTop: 16 }}>
        ← Ver mapa de conhecimento
      </Link>
    </div>
  );

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
      for (const r of res.results) {
        if (r.correct) {
          piDispatch({ type: 'CORRECT_ANSWER', difficulty: 0.5 });
        } else {
          piDispatch({ type: 'WRONG_ANSWER' });
        }
      }
      if (res.updated_concepts?.some((c) => c.percent >= 75)) {
        piDispatch({ type: 'CONCEPT_MASTERED' });
      }
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

      const staticStems = block.questions.map(q => q.stem);
      const allStems = [...staticStems, ...allGeneratedStems];
      const newQ = await api.generateQuestion(
        block.id,
        originalQuestionId,
        incorrectAnswerText ?? undefined,
        allStems,
      );
      setAllGeneratedStems((prev) => [...prev, newQ.stem]);
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
    if (correct) {
      piDispatch({ type: 'CORRECT_ANSWER', difficulty: genQ.difficulty });
    } else {
      piDispatch({ type: 'WRONG_ANSWER' });
    }
    try {
      const updated = await api.recordGeneratedAnswer(
        block.id, genQ.id, originalQuestionId, correct, selectedIndex, genQ,
      );
      setResult((prev) => {
        if (!prev) return prev;
        const concepts = prev.updated_concepts.map((c) =>
          c.id === block.id ? { ...c, percent: updated.percent, level: updated.level as Level } : c,
        );
        return { ...prev, updated_concepts: concepts, global_percent: updated.global_percent };
      });
      const rec = await api.getRecommendation();
      setNextBlockId(rec.next_block_id);
      setNextReason(rec.reason);
    } catch {
      // Mastery update failed silently — feedback still shows
    }
  }

  async function handleExtraPractice() {
    if (!block) return;
    setExtraPracticeLoading(true);
    setExtraPracticeSelected(null);
    setExtraPracticeFeedback(null);
    try {
      const staticStems = block.questions.map(q => q.stem);
      const extraStems = extraPracticeHistory.map(h => h.question.stem);
      const allStems = [...staticStems, ...allGeneratedStems, ...extraStems];
      const newQ = await api.generateQuestion(block.id, undefined, undefined, allStems);
      setExtraPracticeQuestion(newQ);
      setAllGeneratedStems((prev) => [...prev, newQ.stem]);
    } catch (err: any) {
      setError(`Erro ao gerar questão extra: ${err.message}`);
    } finally {
      setExtraPracticeLoading(false);
    }
  }

  async function verifyExtraPractice() {
    if (!extraPracticeQuestion || extraPracticeSelected === null || !block) return;
    const correct = extraPracticeSelected === extraPracticeQuestion.correct_index;
    setExtraPracticeFeedback({
      correct_index: extraPracticeQuestion.correct_index,
      selected_index: extraPracticeSelected,
      solution: extraPracticeQuestion.solution,
    });
    if (correct) {
      piDispatch({ type: 'CORRECT_ANSWER', difficulty: extraPracticeQuestion.difficulty });
    } else {
      piDispatch({ type: 'WRONG_ANSWER' });
    }
    try {
      const updated = await api.recordGeneratedAnswer(
        block.id, extraPracticeQuestion.id, "extra-practice", correct, extraPracticeSelected, extraPracticeQuestion,
      );
      setResult((prev) => {
        if (!prev) return prev;
        const concepts = prev.updated_concepts.map((c) =>
          c.id === block.id ? { ...c, percent: updated.percent, level: updated.level as Level } : c,
        );
        return { ...prev, updated_concepts: concepts, global_percent: updated.global_percent };
      });
      setExtraPracticeHistory((prev) => [...prev, {
        question: extraPracticeQuestion!,
        feedback: {
          correct_index: extraPracticeQuestion!.correct_index,
          selected_index: extraPracticeSelected,
          solution: extraPracticeQuestion!.solution,
        },
      }]);
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
          <>
            <BlockResult
              result={result}
              currentBlockId={blockId}
              nextBlockId={nextBlockId}
              nextReason={nextReason}
              onNext={(id) => router.push(ROUTES.block(id))}
              generatedCorrect={Object.values(generatedFeedback).filter(fb => fb.selected_index === fb.correct_index).length}
              generatedTotal={Object.values(generatedFeedback).length}
            />

            <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "24px 0" }} />
            <div className="sticky-mastery-bar">
              {result.updated_concepts.map((c) => (
                <span key={c.id} className="row" style={{ gap: 8 }}>
                  <span className="muted">{c.id}</span>
                  <strong>{c.percent}%</strong>
                  <LevelBadge level={c.level} />
                </span>
              ))}
              <span className="muted" style={{ fontSize: "0.85rem" }}>Global: {result.global_percent}%</span>
            </div>
            <h3 style={{ marginBottom: 8 }}>Praticar mais</h3>
            <p className="practice-intro">Gere questões extras para melhorar seu domínio neste conceito.</p>

            {extraPracticeHistory.length > 0 && !extraHistoryExpanded && (
              <button
                type="button"
                onClick={() => setExtraHistoryExpanded(true)}
                className="extra-history-balloon"
              >
                <span style={{ fontSize: "1.1rem" }}>
                  {extraPracticeHistory.filter(h => h.feedback.selected_index === h.feedback.correct_index).length}/{extraPracticeHistory.length}
                </span>
                <span style={{ fontSize: "0.8rem" }}>questões extras</span>
                <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>ver todas ▸</span>
              </button>
            )}

            {extraPracticeHistory.length > 0 && extraHistoryExpanded && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span className="muted" style={{ fontSize: "0.85rem" }}>
                    Histórico: {extraPracticeHistory.filter(h => h.feedback.selected_index === h.feedback.correct_index).length}/{extraPracticeHistory.length} corretas
                  </span>
                  <button
                    type="button"
                    onClick={() => setExtraHistoryExpanded(false)}
                    className="btn secondary"
                    style={{ padding: "4px 12px", fontSize: "0.8rem" }}
                  >
                    Recolher ✕
                  </button>
                </div>
                {extraPracticeHistory.map((h, idx) => (
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

            {extraPracticeLoading && (
              <p className="muted">Gerando questão…</p>
            )}

            {extraPracticeQuestion && !extraPracticeLoading && (
              <div style={{ marginBottom: 16 }}>
                <QuestionCard
                  question={extraPracticeQuestion}
                  index={extraPracticeHistory.length}
                  selected={extraPracticeSelected}
                  onSelect={(opt) => setExtraPracticeSelected(opt)}
                  feedback={extraPracticeFeedback}
                />
                {!extraPracticeFeedback ? (
                  <button
                    className="btn secondary"
                    onClick={verifyExtraPractice}
                    disabled={extraPracticeSelected === null}
                    type="button"
                    style={{ marginTop: 8 }}
                  >
                    Verificar resposta
                  </button>
                ) : null}
              </div>
            )}

            {(!extraPracticeLoading && (!extraPracticeQuestion || extraPracticeFeedback)) && (
              <button
                className="btn light-primary"
                onClick={handleExtraPractice}
                disabled={extraPracticeLoading}
                type="button"
              >
                {extraPracticeQuestion ? "Gerar outra questão" : "Praticar mais"}
              </button>
            )}
          </>
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
      <PiWidget mood={mood} />
    </div>
  );
}
