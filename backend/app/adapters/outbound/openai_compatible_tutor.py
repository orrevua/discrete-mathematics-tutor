"""Tutor adapter for any OpenAI-compatible Chat Completions API.

Defaults to Google Gemini's OpenAI-compatible endpoint (cheapest free-tier
option). Uses only the standard library (urllib) — no extra dependency.
"""
from __future__ import annotations

import json
import urllib.error
import urllib.request
from collections.abc import Sequence

from app.application.dto import ChatMessage

# Keep token cost low: cap history and output.
_MAX_HISTORY = 10
_MAX_TOKENS = 600
_TIMEOUT_S = 30


class OpenAICompatibleTutor:
    """Implements TutorPort against an OpenAI-compatible /chat/completions API."""

    def __init__(self, api_key: str, model: str, base_url: str) -> None:
        self._api_key = api_key
        self._model = model
        self._base_url = base_url.rstrip("/")

    def is_configured(self) -> bool:
        return bool(self._api_key)

    def reply(self, system_prompt: str, messages: Sequence[ChatMessage]) -> str:
        history = [{"role": m.role, "content": m.content} for m in messages[-_MAX_HISTORY:]]
        payload = {
            "model": self._model,
            "messages": [{"role": "system", "content": system_prompt}, *history],
            "temperature": 0.3,
            "max_tokens": _MAX_TOKENS,
        }
        req = urllib.request.Request(
            f"{self._base_url}/chat/completions",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {self._api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=_TIMEOUT_S) as resp:
                data = json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            detail = e.read().decode("utf-8", "replace")[:300]
            raise RuntimeError(f"Tutor API erro {e.code}: {detail}") from e
        except urllib.error.URLError as e:
            raise RuntimeError(f"Falha ao contatar o tutor: {e.reason}") from e

        try:
            return data["choices"][0]["message"]["content"].strip()
        except (KeyError, IndexError, AttributeError) as e:
            raise RuntimeError("Resposta inesperada do tutor.") from e
