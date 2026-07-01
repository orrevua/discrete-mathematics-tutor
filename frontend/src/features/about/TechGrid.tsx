import { TECH_GROUPS } from "./content";

export default function TechGrid() {
  return (
    <div className="tech-grid">
      {TECH_GROUPS.map((g) => (
        <div className="tech-group" key={g.group}>
          <h3>{g.group}</h3>
          <div className="tech-chips">
            {g.items.map((it) => (
              <div className="tech-chip" key={it.name}>
                <div className="tech-name">{it.name}</div>
                <div className="tech-role">{it.role}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
