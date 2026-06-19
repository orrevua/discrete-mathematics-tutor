export type Mood = 'focused' | 'celebrating' | 'worried' | 'annoyed' | 'sleeping'

interface PiAvatarProps {
  mood: Mood
  size?: number
}

export function PiAvatar({ mood, size = 108 }: PiAvatarProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 108 120"
      role="img"
      aria-label={`Pi ${moodLabel[mood]}`}
      style={{ transition: 'all 0.3s ease' }}
    >
      <Background mood={mood} />
      <PiSymbol mood={mood} />
      <Face mood={mood} />
      <Decoration mood={mood} />
    </svg>
  )
}

const moodLabel: Record<Mood, string> = {
  focused:     'concentrado',
  celebrating: 'comemorando',
  worried:     'preocupado',
  annoyed:     'incomodado',
  sleeping:    'cochilando',
}

const palette: Record<Mood, { bg: string; stroke: string; ink: string; mid: string }> = {
  focused:     { bg: '#EEEDFE', stroke: '#AFA9EC', ink: '#3C3489', mid: '#7F77DD' },
  celebrating: { bg: '#E1F5EE', stroke: '#5DCAA5', ink: '#085041', mid: '#1D9E75' },
  worried:     { bg: '#FAEEDA', stroke: '#EF9F27', ink: '#633806', mid: '#BA7517' },
  annoyed:     { bg: '#FAECE7', stroke: '#F0997B', ink: '#4A1B0C', mid: '#D85A30' },
  sleeping:    { bg: '#F1EFE8', stroke: '#B4B2A9', ink: '#444441', mid: '#888780' },
}

function Background({ mood }: { mood: Mood }) {
  const { bg, stroke } = palette[mood]
  return (
    <rect
      x="0" y="0" width="108" height="120" rx="20"
      fill={bg} stroke={stroke} strokeWidth="0.5"
    />
  )
}

function PiSymbol({ mood }: { mood: Mood }) {
  const { ink } = palette[mood]
  return (
    <text
      x="54" y="98"
      textAnchor="middle"
      fontFamily="Georgia, serif"
      fontSize="96"
      fontWeight="700"
      fill={ink}
    >
      π
    </text>
  )
}

function Face({ mood }: { mood: Mood }) {
  const { ink, mid } = palette[mood]

  if (mood === 'focused') return (
    <>
      <ellipse cx="34" cy="54" rx="5" ry="5.5" fill={ink} />
      <ellipse cx="74" cy="54" rx="5" ry="5.5" fill={ink} />
      <circle cx="36" cy="52" r="1.5" fill="white" />
      <circle cx="76" cy="52" r="1.5" fill="white" />
      <path d="M38 72 Q54 80 70 72" stroke={ink} strokeWidth="2" fill="none" strokeLinecap="round" />
    </>
  )

  if (mood === 'celebrating') return (
    <>
      <path d="M29 56 Q34 49 39 56" stroke={ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M69 56 Q74 49 79 56" stroke={ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M34 68 Q54 86 74 68" stroke={ink} strokeWidth="2.5" fill={mid} strokeLinecap="round" />
    </>
  )

  if (mood === 'worried') return (
    <>
      <path d="M26 46 Q34 41 40 46" stroke={ink} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M68 46 Q74 41 82 46" stroke={ink} strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx="34" cy="55" rx="5" ry="5.5" fill={ink} />
      <ellipse cx="74" cy="55" rx="5" ry="5.5" fill={ink} />
      <circle cx="35" cy="53" r="1.5" fill="white" />
      <circle cx="75" cy="53" r="1.5" fill="white" />
      <path d="M38 75 Q54 68 70 75" stroke={ink} strokeWidth="2" fill="none" strokeLinecap="round" />
    </>
  )

  if (mood === 'annoyed') return (
    <>
      <path d="M24 42 Q34 48 42 43" stroke={ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M66 43 Q74 48 84 42" stroke={ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <ellipse cx="34" cy="56" rx="5" ry="3.5" fill={ink} />
      <ellipse cx="74" cy="56" rx="5" ry="3.5" fill={ink} />
      <line x1="29" y1="53" x2="39" y2="53" stroke={ink} strokeWidth="2" />
      <line x1="69" y1="53" x2="79" y2="53" stroke={ink} strokeWidth="2" />
      <path d="M36 73 Q54 70 72 73" stroke={ink} strokeWidth="2" fill="none" strokeLinecap="round" />
    </>
  )

  // sleeping
  return (
    <>
      <path d="M28 54 Q34 59 40 54" stroke={ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M68 54 Q74 59 80 54" stroke={ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <ellipse cx="54" cy="73" rx="8" ry="5" fill={mid} />
    </>
  )
}

function Decoration({ mood }: { mood: Mood }) {
  const { mid } = palette[mood]

  if (mood === 'celebrating') return (
    <>
      <text x="8"  y="30" fill={mid} fontSize="14">✦</text>
      <text x="88" y="22" fill={mid} fontSize="11">✦</text>
      <text x="96" y="42" fill={mid} fontSize="9">✦</text>
    </>
  )

  if (mood === 'worried') return (
    <>
      <ellipse cx="88" cy="38" rx="4" ry="6" fill="#FAC775" opacity="0.8" />
      <ellipse cx="88" cy="33" rx="2.5" ry="2.5" fill="#FAC775" opacity="0.8" />
    </>
  )

  if (mood === 'annoyed') return (
    <path d="M86 24 L90 18 L94 24 L90 22 Z" fill={mid} opacity="0.8" />
  )

  if (mood === 'sleeping') return (
    <>
      <text x="82" y="36" fill={mid} fontSize="11" fontFamily="sans-serif" fontWeight="500">z</text>
      <text x="90" y="26" fill={mid} fontSize="14" fontFamily="sans-serif" fontWeight="500">z</text>
      <text x="100" y="14" fill={mid} fontSize="17" fontFamily="sans-serif" fontWeight="500">z</text>
    </>
  )

  return null
}
