"""Application DTOs — what use cases return. Transport-agnostic dataclasses."""
from __future__ import annotations

from dataclasses import dataclass

from app.domain.models import ConceptMastery


@dataclass(frozen=True)
class StateView:
    diagnostic_done: bool
    concept_count: int
    tutor_enabled: bool


@dataclass(frozen=True)
class AnswerOutcome:
    question_id: str
    correct: bool
    correct_index: int
    selected_index: int
    solution: str = ""  # revealed only in grading responses


@dataclass(frozen=True)
class MasteryOverview:
    concepts: list[ConceptMastery]
    global_percent: int


@dataclass(frozen=True)
class SubmitResult:
    results: list[AnswerOutcome]
    updated_concepts: list[ConceptMastery]
    global_percent: int


@dataclass(frozen=True)
class Recommendation:
    next_block_id: str | None
    reason: str


@dataclass(frozen=True)
class ChatMessage:
    role: str  # "user" | "assistant"
    content: str


@dataclass(frozen=True)
class GeneratedQuestion:
    id: str # Unique ID for this generated question
    stem: str
    options: tuple[str, ...]
    correct_index: int
    solution: str
    difficulty: float
