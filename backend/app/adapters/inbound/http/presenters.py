"""Presenters: map domain/application objects to HTTP schemas.

Keeps the mapping in one place so routes stay thin.
"""
from __future__ import annotations

from app.adapters.inbound.http import schemas as s
from app.application.dto import MasteryOverview, Recommendation, StateView, SubmitResult
from app.domain.models import Concept


def state(view: StateView) -> s.StateResponse:
    return s.StateResponse(
        diagnostic_done=view.diagnostic_done,
        concept_count=view.concept_count,
        tutor_enabled=view.tutor_enabled,
    )


def graph(concepts: list[Concept]) -> s.GraphResponse:
    nodes = [
        s.GraphNodeOut(
            id=c.id, title=c.title, unit=c.unit, topic=c.topic, prerequisites=list(c.prerequisites)
        )
        for c in concepts
    ]
    edges = [
        s.GraphEdgeOut(from_=prereq, to=c.id) for c in concepts for prereq in c.prerequisites
    ]
    return s.GraphResponse(nodes=nodes, edges=edges)


def mastery(overview: MasteryOverview) -> s.MasteryResponse:
    return s.MasteryResponse(
        concepts=[
            s.MasteryItemOut(
                id=cm.concept_id,
                mastery=round(cm.mastery, 4),
                level=cm.level.value,
                percent=cm.percent,
                unlocked=cm.unlocked,
            )
            for cm in overview.concepts
        ],
        global_percent=overview.global_percent,
    )


def block(concept: Concept) -> s.BlockResponse:
    return s.BlockResponse(
        id=concept.id,
        title=concept.title,
        unit=concept.unit,
        topic=concept.topic,
        content=concept.content,
        questions=[
            s.PublicQuestionOut(id=q.id, stem=q.stem, options=list(q.options))
            for q in concept.questions
        ],
        practice=[
            s.PublicQuestionOut(id=q.id, stem=q.stem, options=list(q.options))
            for q in concept.practice
        ],
    )


def _result_out(o) -> "s.AnswerResultOut":
    return s.AnswerResultOut(
        question_id=o.question_id,
        correct=o.correct,
        correct_index=o.correct_index,
        selected_index=o.selected_index,
        solution=o.solution,
    )


def answers(result: SubmitResult) -> s.AnswersResponse:
    return s.AnswersResponse(
        results=[_result_out(o) for o in result.results],
        updated_concepts=[
            s.UpdatedConceptOut(
                id=cm.concept_id,
                mastery=round(cm.mastery, 4),
                level=cm.level.value,
                percent=cm.percent,
            )
            for cm in result.updated_concepts
        ],
        global_percent=result.global_percent,
    )


def practice(outcomes) -> s.PracticeResponse:
    return s.PracticeResponse(results=[_result_out(o) for o in outcomes])


def diagnostic(questions) -> s.DiagnosticResponse:
    return s.DiagnosticResponse(
        questions=[
            s.PublicQuestionOut(id=q.id, stem=q.stem, options=list(q.options)) for q in questions
        ]
    )


def recommendation(rec: Recommendation) -> s.RecommendationResponse:
    return s.RecommendationResponse(next_block_id=rec.next_block_id, reason=rec.reason)
