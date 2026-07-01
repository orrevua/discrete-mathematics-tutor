import { FEEDBACK, FEEDBACK_NOTE, MODELS, PIPELINE, PROPOSAL, PROPOSAL_NOTE, ROADMAP } from "./content";

export function ModelTrio() {
  return (
    <div className="model-trio">
      {MODELS.map((m) => (
        <div className="card" key={m.badge}>
          <span className={`badge ${m.badgeClass}`}>{m.badge}</span>
          <h3>{m.title}</h3>
          <p className="model-mech">{m.mech}</p>
          <code>{m.ref}</code>
        </div>
      ))}
    </div>
  );
}

export function FeedbackReinforcement() {
  return (
    <section className="about-section">
      <h2>Feedback e reforço</h2>
      <p className="subtitle">
        O sistema responde a eventos de desempenho, como previsto no pré-projeto.
      </p>
      <div className="model-trio">
        {FEEDBACK.map((f) => (
          <div className="card" key={f.badge}>
            <span className={`badge ${f.badgeClass}`}>{f.badge}</span>
            <h3>{f.title}</h3>
            <p className="model-mech">{f.mech}</p>
            <code>{f.ref}</code>
          </div>
        ))}
      </div>
      <div className="about-note">{FEEDBACK_NOTE}</div>
    </section>
  );
}

export function ArchitecturePipeline() {
  return (
    <div className="about-pipeline">
      {PIPELINE.map((box, i) => (
        <div className="about-pipeline-step" key={box.label}>
          {i > 0 && <span className="about-pipeline-arrow">→</span>}
          <div className="about-pipeline-box">
            <div className="pipe-label">{box.label}</div>
            <div className="pipe-desc">{box.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProposalSection() {
  return (
    <section className="about-section">
      <h2>Visão do Projeto (Pré-projeto)</h2>
      <p className="subtitle">
        Do pré-projeto da disciplina IAED — motivação, escopo e decisões de projeto.
      </p>
      <div className="about-proposal">
        {PROPOSAL.map((p) => (
          <div className="card" key={p.title}>
            <h3>{p.title}</h3>
            <p>{p.body}</p>
          </div>
        ))}
      </div>
      <div className="about-note">{PROPOSAL_NOTE}</div>
    </section>
  );
}

export function Roadmap() {
  return (
    <div className="timeline">
      {ROADMAP.map((r) => (
        <div className="timeline-item" key={r.title}>
          <h4>{r.title}</h4>
          <p>{r.desc}</p>
        </div>
      ))}
    </div>
  );
}
