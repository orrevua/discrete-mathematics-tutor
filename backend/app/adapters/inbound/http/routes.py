"""FastAPI router (driving adapter). Thin: validate input, call the service,
present output. The service is injected via app.state (composition root).
"""
from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, Request

from app.adapters.inbound.http import presenters, schemas
from app.adapters.inbound.http.auth import get_user_id
from app.application.dto import ChatMessage
from app.application.errors import ConceptNotFound, InvalidAnswer, TutorNotConfigured
from app.application.tutoring_service import TutoringService

log = logging.getLogger(__name__)

router = APIRouter(prefix="/api")


def get_service(request: Request) -> TutoringService:
    return request.app.state.service


@router.get("/me", response_model=schemas.MeResponse)
def get_me(request: Request, user_id: str = Depends(get_user_id)):
    claims = getattr(request.state, "jwt_claims", {})
    return schemas.MeResponse(
        user_id=user_id,
        email=claims.get("email"),
        name=(claims.get("user_metadata") or {}).get("name"),
    )


@router.get("/state", response_model=schemas.StateResponse)
def get_state(svc: TutoringService = Depends(get_service), user_id: str = Depends(get_user_id)):
    return presenters.state(svc.get_state(user_id))


@router.post("/reset", response_model=schemas.StateResponse)
def reset_progress(svc: TutoringService = Depends(get_service), user_id: str = Depends(get_user_id)):
    svc.reset_progress(user_id)
    return presenters.state(svc.get_state(user_id))


@router.get("/graph", response_model=schemas.GraphResponse, response_model_by_alias=True)
def get_graph(svc: TutoringService = Depends(get_service)):
    return presenters.graph(svc.get_concepts())


@router.get("/mastery", response_model=schemas.MasteryResponse)
def get_mastery(svc: TutoringService = Depends(get_service), user_id: str = Depends(get_user_id)):
    return presenters.mastery(svc.get_mastery_overview(user_id))


@router.get("/recommendation", response_model=schemas.RecommendationResponse)
def get_recommendation(
    svc: TutoringService = Depends(get_service), user_id: str = Depends(get_user_id)
):
    return presenters.recommendation(svc.get_recommendation(user_id))


@router.get("/blocks/{concept_id}", response_model=schemas.BlockResponse)
def get_block(concept_id: str, svc: TutoringService = Depends(get_service)):
    try:
        return presenters.block(svc.get_block(concept_id))
    except ConceptNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/blocks/{concept_id}/answers", response_model=schemas.PreviousAnswersResponse)
def get_block_answers(
    concept_id: str,
    svc: TutoringService = Depends(get_service),
    user_id: str = Depends(get_user_id),
):
    try:
        graded = svc.get_block_answers(user_id, concept_id)
        practice = svc.get_practice_answers(user_id, concept_id)
    except ConceptNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    return schemas.PreviousAnswersResponse(
        graded=[presenters._result_out(o) for o in graded],
        practice=[presenters._result_out(o) for o in practice],
    )


@router.post("/blocks/{concept_id}/answers", response_model=schemas.AnswersResponse)
def submit_block_answers(
    concept_id: str,
    payload: schemas.AnswerSubmission,
    svc: TutoringService = Depends(get_service),
    user_id: str = Depends(get_user_id),
):
    pairs = [(a.question_id, a.selected_index) for a in payload.answers]
    try:
        return presenters.answers(svc.submit_block_answers(user_id, concept_id, pairs))
    except ConceptNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except InvalidAnswer as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.post("/blocks/{concept_id}/practice", response_model=schemas.PracticeResponse)
def submit_practice(
    concept_id: str,
    payload: schemas.AnswerSubmission,
    svc: TutoringService = Depends(get_service),
    user_id: str = Depends(get_user_id),
):
    pairs = [(a.question_id, a.selected_index) for a in payload.answers]
    try:
        return presenters.practice(svc.submit_practice(user_id, concept_id, pairs))
    except ConceptNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except InvalidAnswer as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.post("/blocks/{concept_id}/tutor", response_model=schemas.TutorReplyResponse)
def tutor(
    concept_id: str,
    payload: schemas.TutorRequest,
    svc: TutoringService = Depends(get_service),
):
    messages = [ChatMessage(role=m.role, content=m.content) for m in payload.messages]
    try:
        return schemas.TutorReplyResponse(reply=svc.tutor_reply(concept_id, messages))
    except ConceptNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except TutorNotConfigured:
        raise HTTPException(
            status_code=503,
            detail="Tutor não configurado. Defina TUTOR_API_KEY no backend/.env.",
        )
    except RuntimeError as e:
        log.exception("Tutor reply failed for concept=%s", concept_id)
        raise HTTPException(status_code=502, detail=str(e))


@router.post("/blocks/{concept_id}/generate_question", response_model=schemas.GenerateQuestionResponse)
def generate_question(
    concept_id: str,
    payload: schemas.GenerateQuestionRequest,
    svc: TutoringService = Depends(get_service),
):
    log.info("generate_question concept=%s original_q=%s", concept_id, payload.original_question_id)
    try:
        result = svc.generate_new_question(
            concept_id=concept_id,
            original_question_id=payload.original_question_id,
            incorrect_answer=payload.incorrect_answer,
        )
        log.info("generate_question success concept=%s question_id=%s", concept_id, result.id)
        return result
    except ConceptNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except TutorNotConfigured:
        raise HTTPException(
            status_code=503,
            detail="Tutor não configurado para geração de questões. Defina TUTOR_API_KEY no backend/.env.",
        )
    except RuntimeError as e:
        log.exception("generate_question failed for concept=%s", concept_id)
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/diagnostic", response_model=schemas.DiagnosticResponse)
def get_diagnostic(svc: TutoringService = Depends(get_service)):
    return presenters.diagnostic(svc.get_diagnostic())


@router.post("/diagnostic/submit", response_model=schemas.DiagnosticSubmitResponse)
def submit_diagnostic(
    payload: schemas.AnswerSubmission,
    svc: TutoringService = Depends(get_service),
    user_id: str = Depends(get_user_id),
):
    pairs = [(a.question_id, a.selected_index) for a in payload.answers]
    try:
        overview = svc.submit_diagnostic(user_id, pairs)
    except InvalidAnswer as e:
        raise HTTPException(status_code=422, detail=str(e))
    return schemas.DiagnosticSubmitResponse(
        diagnostic_done=True, mastery=presenters.mastery(overview)
    )


@router.post("/diagnostic/reset", response_model=schemas.StateResponse)
def reset_diagnostic(svc: TutoringService = Depends(get_service), user_id: str = Depends(get_user_id)):
    svc.reset_diagnostic(user_id)
    return presenters.state(svc.get_state(user_id))
