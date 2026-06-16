"""Outbound ports (driven side of the hexagon).

The application depends on these abstractions, never on concrete adapters.
Structural typing (Protocol) keeps adapters decoupled — any object with the
right shape satisfies the port (Liskov-friendly, no inheritance required).
"""
from __future__ import annotations

from collections.abc import Sequence
from typing import Protocol, runtime_checkable

from app.domain.models import Concept, Question


@runtime_checkable
class ContentRepository(Protocol):
    """Read-only access to the (static, seeded) course content."""

    def all_concepts(self) -> Sequence[Concept]: ...

    def get_concept(self, concept_id: str) -> Concept | None: ...

    def diagnostic_questions(self) -> Sequence[Question]: ...


@runtime_checkable
class ProgressRepository(Protocol):
    """Per-user persistence of progress. Every method is scoped to a `user_id`
    (the authenticated student); content stays global on ContentRepository."""

    def get_all_mastery(self, user_id: str) -> dict[str, float]: ...

    def get_mastery(self, user_id: str, concept_id: str, default: float = 0.0) -> float: ...

    def set_mastery(self, user_id: str, concept_id: str, value: float) -> None: ...

    def log_answer(
        self,
        user_id: str,
        question_id: str,
        concept_id: str,
        selected_idx: int,
        correct: bool,
        source: str,
    ) -> None: ...

    def is_diagnostic_done(self, user_id: str) -> bool: ...

    def mark_diagnostic_done(self, user_id: str) -> None: ...

    def get_answered_questions(
        self, user_id: str, concept_id: str, source: str
    ) -> list[dict]: ...

    def reset(self, user_id: str) -> None:
        """Erase this user's progress (mastery, answer log, flags)."""
        ...

    def clear_diagnostic_status(self, user_id: str) -> None:
        """Clear the diagnostic completion status for a user."""
        ...
