"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api/client";
import { ROUTES, UNIT_NAMES } from "@/lib/constants";
import type { Graph, MasteryItem, MasteryState, State } from "@/lib/types";
import LevelBadge from "@/components/ui/LevelBadge";
import ProgressBar from "@/components/ui/ProgressBar";
import ConfirmDangerModal from "@/components/ui/ConfirmDangerModal";

interface ConceptMeta {
  title: string;
  unit: number;
}

const RESET_PHRASE = "resetar meu progresso";
const RESET_DIAGNOSTIC_PHRASE = "refazer diagnóstico";
const LOW_MASTERY_THRESHOLD = 20; // %

export default function DashboardPage() {
  const router = useRouter();
  const [state, setState] = useState<State | null>(null);
  const [mastery, setMastery] = useState<MasteryState | null>(null);
  const [graph, setGraph] = useState<Graph | null>(null);
  const [error, setError] = useState(false);
  const [showResetProgress, setShowResetProgress] = useState(false);
  const [showResetDiagnostic, setShowResetDiagnostic] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  const load = useCallback(() => {
    Promise.all([api.getState(), api.getMastery(), api.getGraph()])
      .then(([s, m, g]) => {
        setState(s);
        setMastery(m);
        setGraph(g);
      })
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  async function handleResetProgressConfirm() {
    try {
      await api.resetProgress();
      setShowResetProgress(false);
      load();
      setToast({ type: "ok", msg: "Progresso resetado com sucesso." });
    } catch {
      setShowResetProgress(false);
      setToast({ type: "err", msg: "Não foi possível resetar o progresso. Tente novamente." });
    }
  }

  async function handleResetDiagnosticConfirm() {
    try {
      await api.resetDiagnostic();
      setShowResetDiagnostic(false);
      router.push(ROUTES.diagnostic);
    } catch {
      setShowResetDiagnostic(false);
      setToast({ type: "err", msg: "Não foi possível resetar o diagnóstico. Tente novamente." });
    }
  }

  async function continueStudying() {
    const rec = await api.getRecommendation();
    router.push(rec.next_block_id ? ROUTES.block(rec.next_block_id) : ROUTES.graph);
  }

  if (error)
    return (
      <div className="loading">
        Não foi possível conectar ao backend. Verifique se a API está rodando em{" "}
        <code>http://localhost:8000</code>.
      </div>
    );
  if (!state || !mastery || !graph) return <div className="loading">Carregando…</div>;

  const meta = new Map<string, ConceptMeta>(
    graph.nodes.map((n) => [n.id, { title: n.title, unit: n.unit }]),
  );

  const counts = { Dominado: 0, "Em progresso": 0, Iniciante: 0 };
  for (const c of mastery.concepts) counts[c.level]++;

  const units = [...new Set(graph.nodes.map((n) => n.unit))].sort((a, b) => a - b);

  const canResetDiagnostic =
    state.diagnostic_done && mastery.global_percent <= LOW_MASTERY_THRESHOLD;

  return (
    <div>
      <h1>Seu progresso em FMC2</h1>
      <p className="subtitle">Fundamentos Matemáticos da Computação · tutor adaptativo</p>

      <div className="card">
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 10 }}>
          <strong>Domínio global</strong>
          <span>{mastery.global_percent}%</span>
        </div>
        <ProgressBar percent={mastery.global_percent} />
        <div className="spacer" />
        <div className="row" style={{ justifyContent: "space-between" }}>
          {!state.diagnostic_done ? (
            <Link href={ROUTES.diagnostic} className="btn">
              Fazer diagnóstico inicial
            </Link>
          ) : (
            <button className="btn" onClick={continueStudying} type="button">
              Continuar estudando →
            </button>
          )}
          {canResetDiagnostic && (
            <button
              className="btn light-danger"
              onClick={() => setShowResetDiagnostic(true)}
              type="button"
            >
              Refazer diagnóstico
            </button>
          )}
        </div>
      </div>

      <div className="stat-row">
        <Stat value={counts.Dominado} label="Dominado" color="var(--dominado)" />
        <Stat value={counts["Em progresso"]} label="Em progresso" color="var(--progresso)" />
        <Stat value={counts.Iniciante} label="Iniciante" color="var(--muted)" />
      </div>

      {units.map((unit) => (
        <section key={unit}>
          <h2>{UNIT_NAMES[unit]}</h2>
          <div className="concept-list">
            {mastery.concepts
              .filter((c) => meta.get(c.id)?.unit === unit)
              .map((c) => (
                <ConceptRow key={c.id} item={c} title={meta.get(c.id)?.title ?? c.id} />
              ))}
          </div>
          <div className="spacer" />
        </section>
      ))}

      <section className="danger-zone">
        <h2>Zona de perigo</h2>
        <div className="row">
          <span className="muted">
            Resetar seu progresso apaga todo o seu domínio, o histórico de respostas e o
            diagnóstico. Esta ação não pode ser desfeita.
          </span>
          <button className="btn danger" onClick={() => setShowResetProgress(true)} type="button">
            Resetar progresso
          </button>
        </div>
      </section>

      {showResetProgress && (
        <ConfirmDangerModal
          title="Resetar progresso"
          description="Isto vai apagar permanentemente todo o seu domínio, histórico e diagnóstico. Não há como recuperar."
          phrase={RESET_PHRASE}
          confirmLabel="Resetar progresso"
          onConfirm={handleResetProgressConfirm}
          onClose={() => setShowResetProgress(false)}
        />
      )}

      {showResetDiagnostic && (
        <ConfirmDangerModal
          title="Refazer diagnóstico"
          description="Isto vai apagar seu histórico de respostas do diagnóstico, permitindo que você o refaça. Seu progresso em conceitos já desbloqueados será mantido."
          phrase={RESET_DIAGNOSTIC_PHRASE}
          confirmLabel="Refazer diagnóstico"
          onConfirm={handleResetDiagnosticConfirm}
          onClose={() => setShowResetDiagnostic(false)}
        />
      )}

      {toast && (
        <div className={`toast ${toast.type}`} role="status">
          {toast.type === "ok" ? "✓ " : "⚠ "}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="stat">
      <div className="num" style={{ color }}>
        {value}
      </div>
      <div className="lbl">{label}</div>
    </div>
  );
}

function ConceptRow({ item, title }: { item: MasteryItem; title: string }) {
  const inner = (
    <div className="concept-row">
      <span className="name">
        {title} {!item.unlocked && <span className="muted">🔒</span>}
      </span>
      <span className="right">
        <span className="muted">{item.percent}%</span>
        <LevelBadge level={item.level} />
      </span>
    </div>
  );
  return item.unlocked ? <Link href={ROUTES.block(item.id)}>{inner}</Link> : inner;
}
