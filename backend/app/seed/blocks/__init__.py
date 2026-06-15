"""Aggregated course content — all concept blocks in topological order.

Organized per the real FMC2 2025.2 syllabus:
Conteúdo Transversal → Unidade 1 → Unidade 2 → Unidade 3.
"""
from __future__ import annotations

from app.seed.blocks.transversal import CONTEUDO_TRANSVERSAL
from app.seed.blocks.unidade1 import UNIDADE_1
from app.seed.blocks.unidade2 import UNIDADE_2
from app.seed.blocks.unidade3 import UNIDADE_3

CONCEPTS = (*CONTEUDO_TRANSVERSAL, *UNIDADE_1, *UNIDADE_2, *UNIDADE_3)
