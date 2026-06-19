"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence, type TargetAndTransition } from "framer-motion"
import { PiAvatar, type Mood } from "./PiAvatar"

const phrases: Record<Mood, string[]> = {
  focused: [
    "Bora estudar!",
    "Estou aqui com você!",
    "Foco total!",
    "Vamos nessa!",
  ],
  celebrating: [
    "Mandou bem! 🎉",
    "Isso aí! Arrasou!",
    "Excelente! Continue assim!",
    "Você é fera! 💪",
    "Conceito dominado!",
  ],
  worried: [
    "Hmm, não foi dessa vez…",
    "Calma, errar faz parte!",
    "Tenta de novo, você consegue!",
    "Revise o conteúdo acima 👆",
    "Não desanima!",
  ],
  annoyed: [
    "Ei, volta aqui!",
    "Não me abandona! 😤",
    "Foco! Nada de trocar de aba!",
    "Heeey, estamos estudando!",
  ],
  sleeping: [
    "Zzz… ainda tá aí?",
    "Acorda! Temos trabalho!",
    "💤 Vou tirar um cochilo…",
    "Ei… não dormiu, né?",
  ],
}

function pickPhrase(mood: Mood): string {
  const options = phrases[mood]
  return options[Math.floor(Math.random() * options.length)]
}

const avatarAnimations: Record<Mood, TargetAndTransition> = {
  focused: {
    y: [0, -3, 0],
    transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
  },
  celebrating: {
    y: [0, -18, 0, -12, 0, -6, 0],
    rotate: [0, -5, 5, -3, 3, 0],
    scale: [1, 1.1, 1, 1.05, 1],
    transition: { duration: 0.8, ease: "easeOut" },
  },
  worried: {
    x: [0, -6, 6, -5, 5, -3, 3, 0],
    y: [0, 2, 0],
    transition: { duration: 0.5, ease: "easeInOut" },
  },
  annoyed: {
    rotate: [0, -8, 8, -6, 6, -3, 3, 0],
    scale: [1, 1.05, 1],
    transition: { duration: 0.5, ease: "easeOut" },
  },
  sleeping: {
    y: [0, 3, 0],
    scale: [1, 0.97, 1],
    rotate: [0, -2, 0, 2, 0],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
}

interface PiWidgetProps {
  mood: Mood
}

export function PiWidget({ mood }: PiWidgetProps) {
  const [phrase, setPhrase] = useState(() => pickPhrase("focused"))
  const [showBubble, setShowBubble] = useState(true)
  const prevMood = useRef(mood)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (mood !== prevMood.current || mood === "focused") {
      setPhrase(pickPhrase(mood))
      setShowBubble(true)
      prevMood.current = mood

      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        setShowBubble(false)
      }, mood === "focused" ? 6000 : 5000)
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [mood])

  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      right: 24,
      zIndex: 1000,
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: 8,
      pointerEvents: "none",
    }}>
      <AnimatePresence>
        {showBubble && (
          <motion.div
            key={phrase}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            style={{
              background: "white",
              border: "1px solid #e0d6cb",
              borderRadius: 14,
              padding: "10px 16px",
              maxWidth: 210,
              fontSize: "0.85rem",
              lineHeight: 1.4,
              color: "#2d2520",
              boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
              position: "relative",
            }}
          >
            {phrase}
            <div style={{
              position: "absolute",
              bottom: -6,
              right: 28,
              width: 12,
              height: 12,
              background: "white",
              border: "1px solid #e0d6cb",
              borderTop: "none",
              borderLeft: "none",
              transform: "rotate(45deg)",
            }} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        key={mood}
        animate={avatarAnimations[mood]}
        whileHover={{ scale: 1.08, transition: { duration: 0.2 } }}
        whileTap={{ scale: 0.95 }}
        style={{
          pointerEvents: "auto",
          cursor: "pointer",
          filter: "drop-shadow(0 3px 10px rgba(0,0,0,0.18))",
          transformOrigin: "center bottom",
        }}
        onClick={() => {
          setPhrase(pickPhrase(mood))
          setShowBubble(true)
          if (timerRef.current) clearTimeout(timerRef.current)
          timerRef.current = setTimeout(() => setShowBubble(false), 5000)
        }}
      >
        <PiAvatar mood={mood} size={80} />
      </motion.div>
    </div>
  )
}
