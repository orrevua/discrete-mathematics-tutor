"""Inbound auth adapter: resolve the current user id from the request.

Auth is an inbound-adapter concern only -- the application/domain never see JWTs,
just a `user_id: str`. When Supabase Auth is configured (SUPABASE_JWKS_URL set),
the Bearer JWT is verified via JWKS. Otherwise we run in single dev-user mode so
the local zero-config loop keeps working.
"""
from __future__ import annotations

import jwt
from jwt import PyJWKClient
from fastapi import Header, HTTPException, Request

DEV_USER = "dev-user"

_jwk_client: PyJWKClient | None = None


def init_jwks(jwks_url: str) -> None:
    global _jwk_client
    _jwk_client = PyJWKClient(jwks_url)


def get_user_id(
    request: Request,
    authorization: str | None = Header(default=None),
) -> str:
    settings = request.app.state.settings
    if not settings.auth_enabled:
        request.state.jwt_claims = {"sub": DEV_USER, "email": None}
        return DEV_USER

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Nao autenticado.")
    token = authorization.split(" ", 1)[1]

    try:
        signing_key = _jwk_client.get_signing_key_from_jwt(token)  # type: ignore[union-attr]
        claims = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256", "RS256"],
            audience="authenticated",
        )
    except Exception as exc:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=401, detail=f"Token invalido: {exc}")

    user_id = claims.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token sem identificador de usuario.")

    request.state.jwt_claims = claims
    return user_id
