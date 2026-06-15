"""Shared helpers for authoring concept blocks.

`graded(...)` builds a mastery-affecting question; `practice(...)` builds a
study-pool question. Both carry a `solution` that is revealed ONLY after the
student answers (never in pre-grading fetches).
"""
from __future__ import annotations

from app.domain.models import Concept, Question

# Difficulty doubles as the adaptive weight.
EASY = 0.30
MEDIUM = 0.55
HARD = 0.80


def graded(
    qid: str,
    concept_id: str,
    stem: str,
    options: list[str],
    correct: int,
    solution: str,
    diff: float = MEDIUM,
) -> Question:
    return Question(
        id=qid,
        concept_id=concept_id,
        stem=stem,
        options=tuple(options),
        correct_index=correct,
        difficulty=diff,
        solution=solution,
    )


# Practice questions share the same shape; the distinction is where they live
# on the Concept (questions vs practice).
practice = graded


def concept(
    *,
    id: str,
    title: str,
    unit: int,
    topic: int,
    prerequisites: tuple[str, ...] = (),
    content: str,
    questions: tuple[Question, ...],
    practice: tuple[Question, ...] = (),
) -> Concept:
    return Concept(
        id=id,
        title=title,
        unit=unit,
        topic=topic,
        content=content,
        prerequisites=prerequisites,
        questions=questions,
        practice=practice,
    )
