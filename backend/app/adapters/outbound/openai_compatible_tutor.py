"""Tutor adapter for any OpenAI-compatible Chat Completions API.

Defaults to Google Gemini's OpenAI-compatible endpoint (cheapest free-tier
option). Uses only the standard library (urllib) — no extra dependency.
"""
from __future__ import annotations

import json
import urllib.error
import urllib.request
import uuid
from collections.abc import Sequence

from app.application.dto import ChatMessage, GeneratedQuestion

# Keep token cost low: cap history and output.
_MAX_HISTORY = 10
_MAX_TOKENS = 600
_TIMEOUT_S = 30


class OpenAICompatibleTutor:
    """Implements TutorPort against an OpenAI-compatible /chat/completions API."""

    def __init__(self, api_key: str, model: str, base_url: str) -> None:
        self._api_key = api_key
        self._model = model
        self._base_url = base_url.rstrip("/")

    def is_configured(self) -> bool:
        return bool(self._api_key)

    def _call_api(self, messages: list[dict], max_tokens: int, *, json_mode: bool = False) -> dict:
        payload = {
            "model": self._model,
            "messages": messages,
            "temperature": 0.3,
            "max_tokens": max_tokens,
        }
        if json_mode:
            payload["response_format"] = {"type": "json_object"}
        req = urllib.request.Request(
            f"{self._base_url}/chat/completions",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {self._api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=_TIMEOUT_S) as resp:
                data = json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            detail = e.read().decode("utf-8", "replace")[:300]
            raise RuntimeError(f"Tutor API erro {e.code}: {detail}") from e
        except urllib.error.URLError as e:
            raise RuntimeError(f"Falha ao contatar o tutor: {e.reason}") from e
        return data

    def reply(self, system_prompt: str, messages: Sequence[ChatMessage]) -> str:
        history = [{"role": m.role, "content": m.content} for m in messages[-_MAX_HISTORY:]]
        api_messages = [{"role": "system", "content": system_prompt}, *history]
        data = self._call_api(api_messages, _MAX_TOKENS)

        try:
            return data["choices"][0]["message"]["content"].strip()
        except (KeyError, IndexError, AttributeError) as e:
            raise RuntimeError("Resposta inesperada do tutor.") from e

    def generate_question(
        self,
        concept_content: str,
        concept_id: str,
        original_question_id: str | None = None,
        incorrect_answer: str | None = None,
    ) -> GeneratedQuestion:
        system_prompt = (
            f"Você é um gerador de questões de múltipla escolha para o tópico '{concept_id}'.\n"
            f"Gere uma nova questão sobre o conteúdo abaixo, diferente das que o usuário já respondeu.\n"
            f"O conteúdo do conceito é:\n{concept_content}\n\n"
            f"Seu output deve ser um objeto JSON com as seguintes chaves:\n"
            f"  - 'stem': A pergunta em si.\n"
            f"  - 'options': Uma lista de 4 strings para as opções de resposta.\n"
            f"  - 'correct_index': O índice (0-3) da opção correta.\n"
            f"  - 'solution': Uma explicação concisa da resposta correta.\n"
            f"  - 'difficulty': Um float entre 0.3 (fácil), 0.55 (médio) e 0.8 (difícil).\n\n"
            f"Certifique-se de que a questão seja clara, as opções plausíveis e a solução correta.\n"
            f"Exemplo de output:\n"
            f"```json\n{{\n  \"stem\": \"Qual é a capital da França?\",\n  \"options\": [\"Berlim\", \"Madri\", \"Paris\", \"Roma\"],\n  \"correct_index\": 2,\n  \"solution\": \"Paris é a capital da França.\",\n  \"difficulty\": 0.55\n}}\n```\n"
        )
        if original_question_id and incorrect_answer:
            system_prompt += (
                f"\nO usuário errou a questão '{original_question_id}' respondendo '{incorrect_answer}'. "
                f"Gere uma questão que ajude a sanar a possível lacuna de conhecimento revelada por esse erro."
            )

        api_messages = [{"role": "system", "content": system_prompt}]
        data = self._call_api(api_messages, _MAX_TOKENS * 2, json_mode=True)

        try:
            generated_data = json.loads(data["choices"][0]["message"]["content"])
            # Generate a unique ID for this question
            q_id = f"gen-{concept_id}-{uuid.uuid4().hex[:8]}"
            return GeneratedQuestion(
                id=q_id,
                stem=generated_data["stem"],
                options=tuple(generated_data["options"]),
                correct_index=generated_data["correct_index"],
                solution=generated_data["solution"],
                difficulty=generated_data["difficulty"],
            )
        except (KeyError, IndexError, AttributeError, json.JSONDecodeError) as e:
            raise RuntimeError(f"Resposta inesperada ou malformada do tutor para geração de questão: {e}. Raw: {data}") from e

