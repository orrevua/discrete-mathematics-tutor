"""HTTP wire schemas (Pydantic). These live only in the inbound adapter — the
domain and application layers never import them. `correct_index` is exposed
only in grading responses, never in pre-grading fetches.
"""
from __future__ import annotations

from pydantic import BaseModel, Field


class StateResponse(BaseModel):
    diagnostic_done: bool
    concept_count: int
    tutor_enabled: bool


class GraphNodeOut(BaseModel):
    id: str
    title: str
    unit: int
    topic: int
    prerequisites: list[str]


class GraphEdgeOut(BaseModel):
    from_: str = Field(serialization_alias="from")
    to: str


class GraphResponse(BaseModel):
    nodes: list[GraphNodeOut]
    edges: list[GraphEdgeOut]


class MasteryItemOut(BaseModel):
    id: str
    mastery: float
    level: str
    percent: int
    unlocked: bool


class MasteryResponse(BaseModel):
    concepts: list[MasteryItemOut]
    global_percent: int


class PublicQuestionOut(BaseModel):
    id: str
    stem: str
    options: list[str]


class BlockResponse(BaseModel):
    id: str
    title: str
    unit: int
    topic: int
    content: str
    questions: list[PublicQuestionOut]
    practice: list[PublicQuestionOut]


class AnswerIn(BaseModel):
    question_id: str
    selected_index: int = Field(ge=0, le=3)
    # Optional fields for dynamically generated questions
    stem: str | None = None
    options: list[str] | None = None
    correct_index_gen: int | None = Field(None, ge=0, le=3, alias="correct_index") # Renamed to avoid conflict with PublicQuestion
    solution: str | None = None
    difficulty: float | None = Field(None, ge=0.0, le=1.0)


class AnswerSubmission(BaseModel):
    answers: list[AnswerIn]


class AnswerResultOut(BaseModel):
    question_id: str
    correct: bool
    correct_index: int
    selected_index: int
    solution: str = ""


class UpdatedConceptOut(BaseModel):
    id: str
    mastery: float
    level: str
    percent: int


class AnswersResponse(BaseModel):
    results: list[AnswerResultOut]
    updated_concepts: list[UpdatedConceptOut]
    global_percent: int


class PracticeResponse(BaseModel):
    results: list[AnswerResultOut]


class PreviousAnswersResponse(BaseModel):
    graded: list[AnswerResultOut]
    practice: list[AnswerResultOut]


class DiagnosticResponse(BaseModel):
    questions: list[PublicQuestionOut]


class DiagnosticSubmitResponse(BaseModel):
    diagnostic_done: bool
    mastery: MasteryResponse


class RecommendationResponse(BaseModel):
    next_block_id: str | None
    reason: str


class TutorMessageIn(BaseModel):
    role: str = Field(pattern="^(user|assistant)$")
    content: str = Field(min_length=1, max_length=2000)


class TutorRequest(BaseModel):
    messages: list[TutorMessageIn] = Field(min_length=1, max_length=40)


class TutorReplyResponse(BaseModel):
    reply: str


class GenerateQuestionRequest(BaseModel):
    concept_id: str
    original_question_id: str | None = None
    incorrect_answer: str | None = None


class GenerateQuestionResponse(BaseModel):
    id: str
    stem: str
    options: list[str] # Pydantic will handle tuple to list conversion
    correct_index: int = Field(ge=0, le=3)
    solution: str
    difficulty: float = Field(ge=0.0, le=1.0)


class MeResponse(BaseModel):
    user_id: str
    email: str | None = None
    name: str | None = None
