"""Runtime configuration. Reads environment variables, optionally seeded from a
`backend/.env` file (simple KEY=VALUE lines). Secrets never live in code.
"""
from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

_ENV_FILE = Path(__file__).resolve().parent.parent / ".env"


def _load_env_file() -> None:
    if not _ENV_FILE.exists():
        return
    for raw in _ENV_FILE.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key, value = key.strip(), value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


@dataclass(frozen=True)
class Settings:
    tutor_api_key: str
    tutor_model: str
    tutor_base_url: str
    database_url: str
    use_sqlite: bool
    supabase_jwks_url: str

    @property
    def tutor_enabled(self) -> bool:
        return bool(self.tutor_api_key)

    @property
    def auth_enabled(self) -> bool:
        return bool(self.supabase_jwks_url)


def load_settings() -> Settings:
    _load_env_file()
    return Settings(
        database_url=os.getenv("DATABASE_URL", ""),
        use_sqlite=os.getenv("USE_SQLITE", "").lower() in ("1", "true", "yes"),
        supabase_jwks_url=os.getenv("SUPABASE_JWKS_URL", ""),
        tutor_api_key=os.getenv("TUTOR_API_KEY", ""),
        tutor_model=os.getenv("TUTOR_MODEL", "gemini-2.5-flash-lite"),
        tutor_base_url=os.getenv(
            "TUTOR_BASE_URL",
            "https://generativelanguage.googleapis.com/v1beta/openai",
        ),
    )
