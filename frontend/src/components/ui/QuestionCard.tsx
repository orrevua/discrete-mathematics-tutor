"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import type { PublicQuestion } from "@/lib/types";

export interface Feedback {
  correct_index: number;
  selected_index: number;
  solution?: string;
}

interface Props {
  question: PublicQuestion;
  index: number;
  selected: number | null;
  onSelect: (optionIndex: number) => void;
  feedback?: Feedback | null;
}

export default function QuestionCard({ question, index, selected, onSelect, feedback }: Props) {
  const graded = !!feedback;
  const isCorrect = graded && feedback!.selected_index === feedback!.correct_index;

  function optionClass(i: number): string {
    if (graded) {
      if (i === feedback!.correct_index) return "option correct";
      if (i === feedback!.selected_index) return "option wrong";
      return "option";
    }
    return selected === i ? "option selected" : "option";
  }

  return (
    <div className="question">
      <div className="stem">
        {index + 1}. {question.stem}
      </div>
      {question.options.map((opt, i) => (
        <button
          key={i}
          className={optionClass(i)}
          onClick={() => !graded && onSelect(i)}
          disabled={graded}
          type="button"
        >
          {String.fromCharCode(97 + i)}) {opt}
        </button>
      ))}
      {graded && (
        <>
          <div className={`feedback ${isCorrect ? "ok" : "no"}`}>
            {isCorrect
              ? "✓ Correto!"
              : `✗ Resposta correta: ${String.fromCharCode(97 + feedback!.correct_index)})`}
          </div>
          {feedback!.solution && (
            <div className="solution markdown">
              <strong>Resolução</strong>
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{feedback!.solution}</ReactMarkdown>
            </div>
          )}
        </>
      )}
    </div>
  );
}
