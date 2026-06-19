import { motion } from "framer-motion"

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
    <motion.rect
      x="0" y="0" width="108" height="120" rx="20"
      animate={{ fill: bg, stroke }}
      transition={{ duration: 0.4 }}
      strokeWidth="0.5"
    />
  )
}

function PiSymbol({ mood }: { mood: Mood }) {
  const { ink } = palette[mood]
  return (
    <motion.text
      x="54" y="98"
      textAnchor="middle"
      fontFamily="Georgia, serif"
      fontSize="96"
      fontWeight="700"
      animate={{ fill: ink }}
      transition={{ duration: 0.4 }}
    >
      π
    </motion.text>
  )
}

function Face({ mood }: { mood: Mood }) {
  const { ink, mid } = palette[mood]

  if (mood === 'focused') return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* eyes with blink animation */}
      <motion.ellipse
        cx="34" cy="54" rx="5" fill={ink}
        animate={{ ry: [5.5, 5.5, 5.5, 0.5, 5.5] }}
        transition={{ duration: 4, repeat: Infinity, repeatDelay: 2, times: [0, 0.85, 0.9, 0.95, 1] }}
      />
      <motion.ellipse
        cx="74" cy="54" rx="5" fill={ink}
        animate={{ ry: [5.5, 5.5, 5.5, 0.5, 5.5] }}
        transition={{ duration: 4, repeat: Infinity, repeatDelay: 2, times: [0, 0.85, 0.9, 0.95, 1] }}
      />
      <circle cx="36" cy="52" r="1.5" fill="white" />
      <circle cx="76" cy="52" r="1.5" fill="white" />
      <path d="M38 72 Q54 80 70 72" stroke={ink} strokeWidth="2" fill="none" strokeLinecap="round" />
    </motion.g>
  )

  if (mood === 'celebrating') return (
    <motion.g
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <path d="M29 56 Q34 49 39 56" stroke={ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M69 56 Q74 49 79 56" stroke={ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M34 68 Q54 86 74 68" stroke={ink} strokeWidth="2.5" fill={mid} strokeLinecap="round" />
    </motion.g>
  )

  if (mood === 'worried') return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <path d="M26 46 Q34 41 40 46" stroke={ink} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M68 46 Q74 41 82 46" stroke={ink} strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* worried eyes look around */}
      <motion.ellipse
        cx="34" cy="55" rx="5" ry="5.5" fill={ink}
        animate={{ cx: [34, 32, 36, 34] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.ellipse
        cx="74" cy="55" rx="5" ry="5.5" fill={ink}
        animate={{ cx: [74, 72, 76, 74] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.circle
        cx="35" cy="53" r="1.5" fill="white"
        animate={{ cx: [35, 33, 37, 35] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.circle
        cx="75" cy="53" r="1.5" fill="white"
        animate={{ cx: [75, 73, 77, 75] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* wobbly frown */}
      <motion.path
        d="M38 75 Q54 68 70 75" stroke={ink} strokeWidth="2" fill="none" strokeLinecap="round"
        animate={{ d: ["M38 75 Q54 68 70 75", "M38 74 Q54 69 70 74", "M38 75 Q54 68 70 75"] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.g>
  )

  if (mood === 'annoyed') return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* angry eyebrows */}
      <motion.path
        d="M24 42 Q34 48 42 43" stroke={ink} strokeWidth="2.5" fill="none" strokeLinecap="round"
        animate={{ d: ["M24 42 Q34 48 42 43", "M24 40 Q34 47 42 41", "M24 42 Q34 48 42 43"] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      />
      <motion.path
        d="M66 43 Q74 48 84 42" stroke={ink} strokeWidth="2.5" fill="none" strokeLinecap="round"
        animate={{ d: ["M66 43 Q74 48 84 42", "M66 41 Q74 47 84 40", "M66 43 Q74 48 84 42"] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      />
      <ellipse cx="34" cy="56" rx="5" ry="3.5" fill={ink} />
      <ellipse cx="74" cy="56" rx="5" ry="3.5" fill={ink} />
      <line x1="29" y1="53" x2="39" y2="53" stroke={ink} strokeWidth="2" />
      <line x1="69" y1="53" x2="79" y2="53" stroke={ink} strokeWidth="2" />
      <path d="M36 73 Q54 70 72 73" stroke={ink} strokeWidth="2" fill="none" strokeLinecap="round" />
    </motion.g>
  )

  // sleeping
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <path d="M28 54 Q34 59 40 54" stroke={ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M68 54 Q74 59 80 54" stroke={ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* breathing mouth */}
      <motion.ellipse
        cx="54" cy="73" rx="8" fill={mid}
        animate={{ ry: [5, 7, 5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.g>
  )
}

function Decoration({ mood }: { mood: Mood }) {
  const { mid } = palette[mood]

  if (mood === 'celebrating') return (
    <>
      <motion.text
        x="8" y="30" fill={mid} fontSize="14"
        animate={{ y: [30, 20, 30], opacity: [1, 0.6, 1], rotate: [0, 15, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >✦</motion.text>
      <motion.text
        x="88" y="22" fill={mid} fontSize="11"
        animate={{ y: [22, 14, 22], opacity: [0.8, 1, 0.8], rotate: [0, -20, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      >✦</motion.text>
      <motion.text
        x="96" y="42" fill={mid} fontSize="9"
        animate={{ y: [42, 34, 42], opacity: [0.6, 1, 0.6], rotate: [0, 25, 0] }}
        transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
      >✦</motion.text>
    </>
  )

  if (mood === 'worried') return (
    <>
      {/* sweat drop falls and resets */}
      <motion.ellipse
        cx="88" rx="4" ry="6" fill="#FAC775" opacity="0.8"
        animate={{ cy: [38, 50, 38], opacity: [0.8, 0, 0.8] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeIn" }}
      />
      <motion.ellipse
        cx="88" rx="2.5" ry="2.5" fill="#FAC775"
        animate={{ cy: [33, 28, 33], opacity: [0.8, 0.4, 0.8] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  )

  if (mood === 'annoyed') return (
    <motion.path
      d="M86 24 L90 18 L94 24 L90 22 Z" fill={mid} opacity="0.8"
      animate={{ y: [0, -3, 0], opacity: [0.8, 1, 0.8] }}
      transition={{ duration: 0.8, repeat: Infinity }}
    />
  )

  if (mood === 'sleeping') return (
    <>
      <motion.text
        x="82" fill={mid} fontSize="11" fontFamily="sans-serif" fontWeight="500"
        animate={{ y: [36, 28], opacity: [1, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
      >z</motion.text>
      <motion.text
        x="90" fill={mid} fontSize="14" fontFamily="sans-serif" fontWeight="500"
        animate={{ y: [26, 16], opacity: [1, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 0.8 }}
      >z</motion.text>
      <motion.text
        x="100" fill={mid} fontSize="17" fontFamily="sans-serif" fontWeight="500"
        animate={{ y: [14, 2], opacity: [1, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 1.6 }}
      >z</motion.text>
    </>
  )

  return null
}
