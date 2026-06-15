"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import type { AnswersResponse } from "@/lib/types";
import LevelBadge from "@/components/ui/LevelBadge";

interface Props {
  result: AnswersResponse;
  nextBlockId: string | null;
  onNext: (id: string) => void;
}

export default function BlockResult({ result, nextBlockId, onNext }: Props) {
  const correctCount = result.results.filter((r) => r.correct).length;

  return (
    <div>
      <p>
        <strong>
          Você acertou {correctCount} de {result.results.length}.
        </strong>{" "}
        Domínio global: {result.global_percent}%.
      </p>
      {result.updated_concepts.map((c) => (
        <div key={c.id} className="row" style={{ gap: 10, marginBottom: 6 }}>
          <span className="muted">{c.id}</span>
          <span>{c.percent}%</span>
          <LevelBadge level={c.level} />
        </div>
      ))}
      <div className="spacer" />
      <div className="row">
        {nextBlockId ? (
          <button className="btn" onClick={() => onNext(nextBlockId)} type="button">
            Próximo bloco →
          </button>
        ) : (
          <span className="muted">🎉 Você dominou todos os conceitos disponíveis!</span>
        )}
        <Link href={ROUTES.graph} className="btn secondary">
          Ver mapa
        </Link>
      </div>
    </div>
  );
}
