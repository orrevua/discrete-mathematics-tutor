"""Domain entities — framework-free. No FastAPI, no Pydantic, no sqlite here.

These are the core types the whole application reasons about. Adapters translate
to/from these; the domain never depends on adapters (Dependency Inversion).
"""
from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class Level(str, Enum):
    INICIANTE = "Iniciante"
    EM_PROGRESSO = "Em progresso"
    DOMINADO = "Dominado"


@dataclass(frozen=True)
class Question:
    id: str
    concept_id: str
    stem: str
    options: tuple[str, ...]
    correct_index: int
    difficulty: float  # 0.30 easy | 0.55 medium | 0.80 hard
    solution: str = ""  # step-by-step markdown, revealed ONLY after answering

    def is_correct(self, selected_index: int) -> bool:
        return selected_index == self.correct_index


@dataclass(frozen=True)
class Concept:
    id: str
    title: str
    unit: int  # 0 = Conteúdo Transversal, 1 = Unidade 1, 2 = Unidade 2, 3 = Unidade 3
    topic: int  # finer grouping for the knowledge-map columns
    content: str  # deep markdown, pt-BR
    prerequisites: tuple[str, ...] = ()
    questions: tuple[Question, ...] = ()  # exactly 3 — these drive mastery
    practice: tuple[Question, ...] = ()  # study pool — interactive, do NOT affect mastery


@dataclass(frozen=True)
class ConceptMastery:
    """A concept's mastery snapshot — a domain value object."""

    concept_id: str
    mastery: float
    level: Level
    percent: int
    unlocked: bool
