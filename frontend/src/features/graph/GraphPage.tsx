"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { LEVEL_CLASS, ROUTES, TOPIC_NAMES } from "@/lib/constants";
import type { Graph, GraphNode, MasteryItem } from "@/lib/types";
import ProgressBar from "@/components/ui/ProgressBar";
import { useGraphEdges } from "./useGraphEdges";

interface Tooltip {
  text: string;
  x: number;
  y: number;
}

export default function GraphPage() {
  const router = useRouter();
  const [graph, setGraph] = useState<Graph | null>(null);
  const [mastery, setMastery] = useState<MasteryItem[]>([]);
  const [globalPercent, setGlobalPercent] = useState(0);
  const [error, setError] = useState(false);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  const { containerRef, setNodeRef, lines } = useGraphEdges(graph);

  useEffect(() => {
    Promise.all([api.getGraph(), api.getMastery()])
      .then(([g, m]) => {
        setGraph(g);
        setMastery(m.concepts);
        setGlobalPercent(m.global_percent);
      })
      .catch(() => setError(true));
  }, []);

  const showTooltip = useCallback((e: React.MouseEvent, text: string | undefined) => {
    if (!text) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltip({ text, x: rect.left + rect.width / 2, y: rect.top - 8 });
  }, []);

  const hideTooltip = useCallback(() => setTooltip(null), []);

  if (error) return <div className="loading">Erro ao carregar o mapa de conhecimento.</div>;
  if (!graph) return <div className="loading">Carregando mapa…</div>;

  const masteryById = new Map(mastery.map((m) => [m.id, m]));
  const titleById = new Map(graph.nodes.map((n) => [n.id, n.title]));
  const dependentTitles = new Map<string, string[]>();
  for (const node of graph.nodes) {
    for (const pid of node.prerequisites) {
      const list = dependentTitles.get(pid) ?? [];
      list.push(node.title);
      dependentTitles.set(pid, list);
    }
  }

  function tooltipFor(node: GraphNode): string | undefined {
    const prereqs = node.prerequisites.map((id) => titleById.get(id)).filter(Boolean) as string[];
    const deps = dependentTitles.get(node.id) ?? [];
    const parts: string[] = [];
    if (prereqs.length) parts.push(`Requer: ${prereqs.join(", ")}`);
    if (deps.length) parts.push(`Libera: ${deps.join(", ")}`);
    return parts.length ? parts.join("\n") : undefined;
  }

  const topics = [...new Set(graph.nodes.map((n) => n.topic))].sort((a, b) => a - b);

  return (
    <div>
      <h1>Mapa de conhecimento</h1>
      <p className="subtitle">
        Cada conceito é colorido pelo seu nível de domínio. Conceitos bloqueados (🔒) exigem
        pré-requisitos.
      </p>
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
          <strong>Domínio global</strong>
          <span>{globalPercent}%</span>
        </div>
        <ProgressBar percent={globalPercent} />
      </div>

      <div className="graph-wrap">
        <div className="graph-grid" ref={containerRef}>
          <svg className="edges">
            {lines.map((l, i) => (
              <path key={i} d={l.d} fill="none" stroke="#cdc8ba" strokeWidth={1.5} strokeOpacity={0.7} strokeLinecap="round" />
            ))}
          </svg>
          {topics.map((topic) => (
            <div className="topic-col" key={topic}>
              <h3>
                {topic}. {TOPIC_NAMES[topic]}
              </h3>
              {graph.nodes
                .filter((n) => n.topic === topic)
                .map((node) => {
                  const m = masteryById.get(node.id);
                  const level = m?.level ?? "Iniciante";
                  const unlocked = m?.unlocked ?? false;
                  const tip = tooltipFor(node);
                  return (
                    <div
                      key={node.id}
                      ref={setNodeRef(node.id)}
                      className={`node lvl-${LEVEL_CLASS[level]} ${unlocked ? "" : "locked"}`}
                      onClick={() => unlocked && router.push(ROUTES.block(node.id))}
                      onMouseEnter={(e) => showTooltip(e, tip)}
                      onMouseLeave={hideTooltip}
                    >
                      <div className="node-title">
                        {node.title} {!unlocked && "🔒"}
                      </div>
                      <div className="node-meta">
                        <span>{level}</span>
                        <span>{m?.percent ?? 0}%</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>

      {tooltip && (
        <div
          className="graph-tooltip"
          style={{ left: tooltip.x, top: tooltip.y, transform: "translate(-50%, -100%)" }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
