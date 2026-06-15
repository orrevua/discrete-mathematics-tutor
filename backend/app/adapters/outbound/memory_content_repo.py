"""In-memory adapter for ContentRepository, backed by the seeded course data.

Content is static and version-controlled (see app/seed). Loaded once.
"""
from __future__ import annotations

from collections.abc import Sequence

from app.domain.models import Concept, Question
from app.seed import load_concepts, load_diagnostic


class MemoryContentRepository:
    """Implements the ContentRepository port."""

    def __init__(self) -> None:
        self._concepts: tuple[Concept, ...] = tuple(load_concepts())
        self._by_id: dict[str, Concept] = {c.id: c for c in self._concepts}
        self._diagnostic: tuple[Question, ...] = tuple(load_diagnostic())

    def all_concepts(self) -> Sequence[Concept]:
        return self._concepts

    def get_concept(self, concept_id: str) -> Concept | None:
        return self._by_id.get(concept_id)

    def diagnostic_questions(self) -> Sequence[Question]:
        return self._diagnostic
