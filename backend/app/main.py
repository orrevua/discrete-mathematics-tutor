"""Composition root: build adapters, inject them into the application service,
and expose the FastAPI app. This is the only place that knows about concrete
adapters — every other layer depends on abstractions.

Run: uvicorn app.main:app --reload  (from the backend/ directory)
"""
from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.adapters.inbound.http.routes import router
from app.adapters.outbound.memory_content_repo import MemoryContentRepository
from app.adapters.outbound.openai_compatible_tutor import OpenAICompatibleTutor
from app.adapters.outbound.sqlite_progress_repo import SqliteProgressRepository
from app.application.tutoring_service import TutoringService
from app.config import Settings, load_settings
from app.ports.repositories import ProgressRepository

DB_PATH = Path(__file__).resolve().parent.parent / "its.db"

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]


def build_service(settings: Settings) -> TutoringService:
    content = MemoryContentRepository()

    progress: ProgressRepository
    if settings.database_url and not settings.use_sqlite:
        # Persistent store for deployment (survives ephemeral-host restarts).
        from app.adapters.outbound.postgres_progress_repo import PostgresProgressRepository

        progress = PostgresProgressRepository(settings.database_url)
    else:
        progress = SqliteProgressRepository(DB_PATH)

    tutor = OpenAICompatibleTutor(
        api_key=settings.tutor_api_key,
        model=settings.tutor_model,
        base_url=settings.tutor_base_url,
    )
    return TutoringService(content=content, progress=progress, tutor=tutor)


def create_app() -> FastAPI:
    settings = load_settings()
    app = FastAPI(title="ITS FMC2", version="1.0.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_ORIGINS,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.state.settings = settings
    if settings.auth_enabled:
        from app.adapters.inbound.http.auth import init_jwks
        init_jwks(settings.supabase_jwks_url)
    app.state.service = build_service(settings)
    app.include_router(router)
    return app


app = create_app()
