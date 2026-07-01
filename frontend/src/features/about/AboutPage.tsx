import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { STATS } from "./content";
import { ModelTrio, ArchitecturePipeline, ProposalSection, Roadmap } from "./AboutSections";
import TechGrid from "./TechGrid";
import EwmaSection from "./EwmaSection";

export default function AboutPage() {
  return (
    <div>
      <section className="about-hero">
        <div className="about-hero-inner">
          <span className="about-kicker">Sistema de Tutoria Inteligente</span>
          <h1>Tutor Inteligente · FMC2</h1>
          <p className="about-tagline">
            Um tutor adaptativo para Fundamentos Matemáticos da Computação: grafo de conhecimento,
            domínio rastreado por EWMA e um tutor por IA travado no tópico.
          </p>
        </div>
      </section>

      <div className="stat-row">
        {STATS.map((s) => (
          <div className="stat" key={s.lbl}>
            <div className="num">{s.num}</div>
            <div className="lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      <ProposalSection />

      <section className="about-section">
        <h2>Como funciona o ITS</h2>
        <p className="subtitle">
          Os três modelos clássicos de um Intelligent Tutoring System, mapeados ao código.
        </p>
        <ModelTrio />
      </section>

      <section className="about-section">
        <h2>Arquitetura</h2>
        <p className="subtitle">Do cliente ao domínio, passando por uma API hexagonal.</p>
        <ArchitecturePipeline />
      </section>

      <section className="about-section">
        <h2>Tecnologias</h2>
        <p className="subtitle">Stack real, extraída dos manifests e adapters do projeto.</p>
        <TechGrid />
      </section>

      <EwmaSection />

      <section className="about-section">
        <h2>Linha do tempo</h2>
        <p className="subtitle">Principais marcos entregues.</p>
        <Roadmap />
      </section>

      <div className="row" style={{ justifyContent: "center", marginTop: 8 }}>
        <Link className="btn" href={ROUTES.dashboard}>
          Ir para o painel
        </Link>
        <Link className="btn secondary" href={ROUTES.graph}>
          Ver mapa de conhecimento
        </Link>
      </div>
    </div>
  );
}
