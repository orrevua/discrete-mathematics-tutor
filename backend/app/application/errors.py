"""Application-level errors. Adapters map these to transport status codes."""
from __future__ import annotations


class ConceptNotFound(Exception):
    def __init__(self, concept_id: str) -> None:
        super().__init__(f"Conceito '{concept_id}' não encontrado.")
        self.concept_id = concept_id


class InvalidAnswer(Exception):
    """A submitted question_id does not belong to the expected set."""


class TutorNotConfigured(Exception):
    """The AI tutor has no provider/API key configured."""
