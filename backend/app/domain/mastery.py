"""Mastery domain service — pure functions, fully explainable, no I/O.

EWMA update: a correct hard answer pulls mastery toward ~0.9; a wrong hard answer
toward ~0.1; easy questions move toward ~0.75 / ~0.25. alpha=0.3 gives visible,
stable movement across a 3-question block. See docs/specs/its-fmc2-spec.md.
"""
from __future__ import annotations

from app.domain.models import Level

ALPHA = 0.3
LEVEL_PROGRESS = 0.4
LEVEL_MASTERED = 0.75
UNLOCK_THRESHOLD = 0.6
DIAGNOSTIC_PRIOR = 0.5


def clamp01(x: float) -> float:
    return max(0.0, min(1.0, x))


def update(mastery: float, correct: bool, difficulty: float) -> float:
    reward = (0.5 + 0.5 * difficulty) if correct else (0.5 - 0.5 * difficulty)
    return clamp01((1 - ALPHA) * mastery + ALPHA * reward)


def level_of(mastery: float) -> Level:
    if mastery >= LEVEL_MASTERED:
        return Level.DOMINADO
    if mastery >= LEVEL_PROGRESS:
        return Level.EM_PROGRESSO
    return Level.INICIANTE


def percent_of(mastery: float) -> int:
    return round(mastery * 100)
