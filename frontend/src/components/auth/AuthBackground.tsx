// Decorative, subject-themed backdrop for the login screen: a soft Venn diagram
// (set theory) plus scattered set/logic glyphs. Purely decorative.

const GLYPHS: { c: string; top: string; left: string; size: number; rot: number }[] = [
  { c: "∈", top: "12%", left: "10%", size: 64, rot: -12 },
  { c: "⊆", top: "70%", left: "8%", size: 80, rot: 8 },
  { c: "∪", top: "22%", left: "84%", size: 88, rot: 10 },
  { c: "∩", top: "78%", left: "82%", size: 72, rot: -8 },
  { c: "∅", top: "44%", left: "4%", size: 56, rot: 0 },
  { c: "ℕ", top: "8%", left: "46%", size: 60, rot: -6 },
  { c: "ℝ", top: "86%", left: "44%", size: 60, rot: 6 },
  { c: "∀", top: "16%", left: "68%", size: 52, rot: 14 },
  { c: "∃", top: "60%", left: "90%", size: 52, rot: -10 },
  { c: "{a,b}", top: "84%", left: "20%", size: 34, rot: -4 },
  { c: "A ∪ B", top: "34%", left: "88%", size: 30, rot: 6 },
  { c: "→", top: "52%", left: "70%", size: 56, rot: 0 },
  { c: "≡", top: "30%", left: "16%", size: 56, rot: 10 },
  { c: "ℤ", top: "92%", left: "66%", size: 48, rot: -8 },
];

export default function AuthBackground() {
  return (
    <div className="auth-bg" aria-hidden="true">
      <svg className="auth-venn" viewBox="0 0 400 320" xmlns="http://www.w3.org/2000/svg">
        <circle cx="160" cy="140" r="110" fill="#d97757" fillOpacity="0.10" />
        <circle cx="240" cy="140" r="110" fill="#6a9bcc" fillOpacity="0.10" />
        <circle cx="200" cy="210" r="110" fill="#788c5d" fillOpacity="0.10" />
      </svg>
      {GLYPHS.map((g, i) => (
        <span
          key={i}
          className="auth-glyph"
          style={{
            top: g.top,
            left: g.left,
            fontSize: `${g.size}px`,
            transform: `rotate(${g.rot}deg)`,
          }}
        >
          {g.c}
        </span>
      ))}
    </div>
  );
}
