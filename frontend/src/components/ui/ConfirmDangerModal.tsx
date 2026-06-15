"use client";

import { useState } from "react";

interface Props {
  title: string;
  description: string;
  /** The exact phrase the user must type to enable the action. */
  phrase: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export default function ConfirmDangerModal({
  title,
  description,
  phrase,
  confirmLabel,
  onConfirm,
  onClose,
}: Props) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const matches = value.trim() === phrase;

  async function handleConfirm() {
    if (!matches || busy) return;
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={busy ? undefined : onClose}>
      <div className="modal danger" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p className="muted">{description}</p>
        <label className="modal-label">
          Para confirmar, digite <code>{phrase}</code> abaixo:
        </label>
        <input
          className="modal-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={phrase}
          autoFocus
          spellCheck={false}
        />
        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose} disabled={busy} type="button">
            Cancelar
          </button>
          <button className="btn danger" onClick={handleConfirm} disabled={!matches || busy} type="button">
            {busy ? "Resetando…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
