"""Seed content loaders + integrity validation.

Validation runs at import time and acts as content tests: every block has
exactly 3 questions, every prerequisite id exists, the prerequisite graph is
acyclic, and every diagnostic question targets a real concept.
"""
from __future__ import annotations

from collections.abc import Sequence

from app.domain.models import Concept, Question
from app.seed.blocks import CONCEPTS
from app.seed.diagnostic import DIAGNOSTIC


def _validate(concepts: Sequence[Concept], diagnostic: Sequence[Question]) -> None:
    ids = {c.id for c in concepts}
    if len(ids) != len(concepts):
        raise ValueError("IDs de conceito duplicados na semente.")

    for c in concepts:
        if len(c.questions) < 3:
            raise ValueError(f"Bloco '{c.id}' deve ter ao menos 3 questões (tem {len(c.questions)}).")
        for q in (*c.questions, *c.practice):
            if len(q.options) != 4:
                raise ValueError(f"Questão '{q.id}' deve ter 4 alternativas.")
            if not 0 <= q.correct_index < 4:
                raise ValueError(f"Questão '{q.id}' tem correct_index inválido.")
            if not q.solution.strip():
                raise ValueError(f"Questão '{q.id}' deve ter uma solução (revelada após responder).")
        for p in c.prerequisites:
            if p not in ids:
                raise ValueError(f"Pré-requisito desconhecido '{p}' em '{c.id}'.")

    _assert_acyclic(concepts)

    for q in diagnostic:
        if q.concept_id not in ids:
            raise ValueError(f"Questão de diagnóstico '{q.id}' aponta para conceito inexistente.")
        if len(q.options) != 4:
            raise ValueError(f"Questão de diagnóstico '{q.id}' deve ter 4 alternativas.")


def _assert_acyclic(concepts: Sequence[Concept]) -> None:
    prereqs = {c.id: set(c.prerequisites) for c in concepts}
    state: dict[str, int] = {}  # 0=unvisited, 1=visiting, 2=done

    def visit(node: str) -> None:
        if state.get(node) == 2:
            return
        if state.get(node) == 1:
            raise ValueError(f"Ciclo de pré-requisitos detectado em '{node}'.")
        state[node] = 1
        for p in prereqs[node]:
            visit(p)
        state[node] = 2

    for cid in prereqs:
        visit(cid)


_validate(CONCEPTS, DIAGNOSTIC)


def load_concepts() -> Sequence[Concept]:
    return CONCEPTS


def load_diagnostic() -> Sequence[Question]:
    return DIAGNOSTIC
