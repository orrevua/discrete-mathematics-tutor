"use client"

import { useEffect, useState, useRef } from "react"
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

interface PiWidgetProps {
  mood: Mood
}

export function PiWidget({ mood }: PiWidgetProps) {
  const [phrase, setPhrase] = useState(() => pickPhrase("focused"))
  const [showBubble, setShowBubble] = useState(true)
  const [bubbleVisible, setBubbleVisible] = useState(true)
  const prevMood = useRef(mood)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (mood !== prevMood.current || mood === "focused") {
      setPhrase(pickPhrase(mood))
      setShowBubble(true)
      setBubbleVisible(true)
      prevMood.current = mood

      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        setBubbleVisible(false)
        setTimeout(() => setShowBubble(false), 300)
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
      {showBubble && (
        <div style={{
          background: "white",
          border: "1px solid #e0d6cb",
          borderRadius: 12,
          padding: "8px 14px",
          maxWidth: 200,
          fontSize: "0.85rem",
          lineHeight: 1.4,
          color: "#2d2520",
          boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
          opacity: bubbleVisible ? 1 : 0,
          transform: bubbleVisible ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
          position: "relative",
        }}>
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
        </div>
      )}
      <div style={{
        pointerEvents: "auto",
        cursor: "default",
        filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.15))",
        transition: "transform 0.3s ease",
      }}>
        <PiAvatar mood={mood} size={80} />
      </div>
    </div>
  )
}
