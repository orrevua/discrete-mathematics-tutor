"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { api } from "@/lib/api/client";
import type { TutorMessage } from "@/lib/types";

interface Props {
  conceptId: string;
  title: string;
  enabled: boolean;
  onClose: () => void;
}

export default function TutorChat({ conceptId, title, enabled, onClose }: Props) {
  const [messages, setMessages] = useState<TutorMessage[]>([
    {
      role: "assistant",
      content: `Olá! Sou seu tutor para **${title}**. Pergunte o que quiser sobre este tópico — só consigo ajudar com ele.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    const next = [...messages, { role: "user", content: text } as TutorMessage];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      // Only the real conversation turns go to the API (skip the greeting).
      const history = next.filter((_, i) => i > 0);
      const { reply } = await api.tutor(conceptId, history);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: `⚠️ ${e instanceof Error ? e.message : "Erro ao falar com o tutor."}` },
      ]);
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <aside className="tutor">
      <div className="tutor-head">
        <div>
          <div className="tutor-title">Tutor · {title}</div>
          <div className="tutor-sub">Diálogo guiado, restrito a este tópico</div>
        </div>
        <button className="tutor-close" onClick={onClose} type="button" aria-label="Fechar tutor">
          ✕
        </button>
      </div>

      <div className="tutor-messages" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role}`}>
            <div className="markdown">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{m.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {sending && <div className="bubble assistant typing">digitando…</div>}
      </div>

      {enabled ? (
        <div className="tutor-input">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Faça uma pergunta sobre o tópico…"
            rows={2}
          />
          <button className="btn" onClick={send} disabled={sending || !input.trim()} type="button">
            Enviar
          </button>
        </div>
      ) : (
        <div className="tutor-disabled">
          Tutor não configurado. Adicione <code>TUTOR_API_KEY</code> em <code>backend/.env</code>{" "}
          (chave gratuita em aistudio.google.com) e reinicie o backend.
        </div>
      )}
    </aside>
  );
}
