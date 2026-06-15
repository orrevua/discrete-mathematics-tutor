"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { LEVEL_CLASS, ROUTES, TOPIC_NAMES } from "@/lib/constants";
import type { Graph, MasteryItem } from "@/lib/types";
import ProgressBar from "@/components/ui/ProgressBar";
import { useGraphEdges } from "./useGraphEdges";

export default function GraphPage() {
  const router = useRouter();
  const [graph, setGraph] = useState<Graph | null>(null);
  const [mastery, setMastery] = useState<MasteryItem[]>([]);
  const [globalPercent, setGlobalPercent] = useState(0);
  const [error, setError] = useState(false);

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

  if (error) return <div className="loading">Erro ao carregar o mapa de conhecimento.</div>;
  if (!graph) return <div className="loading">Carregando mapa…</div>;

  const masteryById = new Map(mastery.map((m) => [m.id, m]));
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
                  return (
                    <div
                      key={node.id}
                      ref={setNodeRef(node.id)}
                      className={`node lvl-${LEVEL_CLASS[level]} ${unlocked ? "" : "locked"}`}
                      onClick={() => unlocked && router.push(ROUTES.block(node.id))}
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
    </div>
  );
}
