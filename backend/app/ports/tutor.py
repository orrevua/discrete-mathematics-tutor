"""Outbound port for the AI tutor (driven side).

The application depends on this abstraction; concrete LLM providers are adapters
wired at the composition root. Keeping it a Protocol means any provider with the
right shape satisfies it.
"""
from __future__ import annotations

from collections.abc import Sequence
from typing import Protocol, runtime_checkable

from app.application.dto import ChatMessage


@runtime_checkable
class TutorPort(Protocol):
    def is_configured(self) -> bool:
        """True when a provider/API key is available."""
        ...

    def reply(self, system_prompt: str, messages: Sequence[ChatMessage]) -> str:
        """Return the assistant's reply given a system prompt and the history."""
        ...
