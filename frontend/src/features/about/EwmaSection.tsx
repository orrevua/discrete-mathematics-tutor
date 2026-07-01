"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { LEVELS } from "./content";

const FORMULA = "$$m' = 0.7\\,m + 0.3\\,\\text{recompensa}$$";

export default function EwmaSection() {
  return (
    <section className="about-section">
      <h2>Adaptatividade (EWMA)</h2>
      <p className="subtitle">
        O domínio de cada conceito é uma média móvel exponencial — explicável e sem saltos bruscos.
      </p>
      <div className="card">
        <div className="ewma-formula markdown">
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
            {FORMULA}
          </ReactMarkdown>
        </div>
        <p className="muted">
          A recompensa é <code>0,5 ± 0,5 × dificuldade</code>: acertar uma questão difícil vale mais,
          errar uma fácil penaliza mais. O peso 0,3 evita saltos bruscos no domínio.
        </p>
        <div className="ewma-levels">
          {LEVELS.map((l) => (
            <span className={`badge ${l.cls}`} key={l.badge}>
              {l.badge} · {l.range}
            </span>
          ))}
        </div>
        <p className="muted" style={{ margin: "10px 0 0" }}>
          Um conceito só é liberado quando todos os pré-requisitos atingem domínio ≥ 0,6; entre os
          liberados e não dominados, o sistema recomenda o de menor domínio.
        </p>
      </div>
    </section>
  );
}
