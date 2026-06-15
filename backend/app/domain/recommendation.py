"""Recommendation domain service — prerequisite-aware next-block selection.

Pure: depends only on concept topology and a mastery mapping.
"""
from __future__ import annotations

from collections.abc import Mapping, Sequence

from app.domain.mastery import LEVEL_MASTERED, UNLOCK_THRESHOLD
from app.domain.models import Concept


def is_unlocked(concept: Concept, masteries: Mapping[str, float]) -> bool:
    """Unlocked when every prerequisite is at/above the unlock gate."""
    return all(masteries.get(p, 0.0) >= UNLOCK_THRESHOLD for p in concept.prerequisites)


def recommend(
    concepts: Sequence[Concept],
    masteries: Mapping[str, float],
) -> tuple[str | None, str]:
    """Return (next_concept_id, reason).

    Candidates: unlocked concepts not yet Dominado. Pick lowest mastery;
    tie-break by topological order (the `concepts` sequence order).
    """
    order = {c.id: i for i, c in enumerate(concepts)}
    candidates = [
        c
        for c in concepts
        if masteries.get(c.id, 0.0) < LEVEL_MASTERED and is_unlocked(c, masteries)
    ]
    if not candidates:
        return None, "Curso concluído."
    best = min(candidates, key=lambda c: (masteries.get(c.id, 0.0), order[c.id]))
    return best.id, "Pré-requisitos dominados; menor domínio entre desbloqueados."
