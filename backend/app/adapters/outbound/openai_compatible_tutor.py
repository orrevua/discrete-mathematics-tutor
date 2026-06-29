"""Tutor adapter for any OpenAI-compatible Chat Completions API.

Defaults to Google Gemini's OpenAI-compatible endpoint (cheapest free-tier
option). Uses only the standard library (urllib) -- no extra dependency.
"""
from __future__ import annotations

import json
import logging
import urllib.error
import urllib.request
import uuid
from collections.abc import Sequence

from app.application.dto import ChatMessage, GeneratedQuestion

log = logging.getLogger(__name__)

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

    def _call_api(self, messages: list[dict], max_tokens: int, temperature: float = 0.3) -> dict:
        payload = {
            "model": self._model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        url = f"{self._base_url}/chat/completions"
        log.info("Tutor API request: model=%s url=%s messages=%d max_tokens=%d",
                 self._model, url, len(messages), max_tokens)
        req = urllib.request.Request(
            url,
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
            detail = e.read().decode("utf-8", "replace")[:500]
            log.error("Tutor API HTTP error %d: %s", e.code, detail)
            raise RuntimeError(f"Tutor API erro {e.code}: {detail}") from e
        except urllib.error.URLError as e:
            log.error("Tutor API connection error: %s", e.reason)
            raise RuntimeError(f"Falha ao contatar o tutor: {e.reason}") from e
        log.info("Tutor API response: usage=%s", data.get("usage"))
        return data

    def reply(self, system_prompt: str, messages: Sequence[ChatMessage]) -> str:
        history = [{"role": m.role, "content": m.content} for m in messages[-_MAX_HISTORY:]]
        api_messages = [{"role": "system", "content": system_prompt}, *history]
        data = self._call_api(api_messages, _MAX_TOKENS)
        try:
            return data["choices"][0]["message"]["content"].strip()
        except (KeyError, IndexError, AttributeError) as e:
            log.error("Unexpected tutor reply structure: %s", data)
            raise RuntimeError("Resposta inesperada do tutor.") from e

    def generate_question(
        self,
        concept_content: str,
        concept_id: str,
        original_question_id: str | None = None,
        incorrect_answer: str | None = None,
        previous_stems: list[str] | None = None,
    ) -> GeneratedQuestion:
        log.info("Generating question for concept=%s original_q=%s",
                 concept_id, original_question_id)
        system_prompt = (
            "Voce e um gerador de questoes de multipla escolha para um sistema de tutoria inteligente. "
            "REGRA CRITICA DE DIVERSIDADE: cada questao gerada DEVE testar um SUB-TOPICO ou HABILIDADE "
            "diferente das questoes anteriores. Nunca repita o mesmo tema, padrao de raciocinio ou "
            "estrutura de problema, mesmo com numeros ou nomes diferentes. "
            "Se as questoes anteriores testam 'usar exemplo para provar caso geral', a proxima DEVE "
            "testar algo completamente diferente (ex: diferenciar definicao de teorema, identificar "
            "tipo de demonstracao, aplicar regra de inferencia, etc). "
            "Gere questoes que exijam raciocinio, aplicacao ou analise — NUNCA perguntas puramente "
            "definitórias como 'o que e X?' ou 'qual termo descreve Y?'. "
            "Responda SOMENTE com um objeto JSON valido, sem markdown, sem blocos de codigo."
        )
        user_prompt = (
            f"Gere uma questao de multipla escolha sobre o topico '{concept_id}'.\n"
            f"Conteudo do conceito:\n{concept_content}\n\n"
            f"REGRAS:\n"
            f"- A questao deve exigir raciocinio ou aplicacao, nao apenas memorizacao de definicoes.\n"
            f"- Use cenarios, exemplos concretos ou situacoes-problema.\n"
            f"- As alternativas incorretas devem ser plausíveis (erros comuns de raciocínio).\n"
            f"- VARIE o sub-topico: se questoes anteriores ja cobriram um aspecto, escolha OUTRO.\n"
            f"- NAO gere questoes com o mesmo padrao tematico das anteriores, mesmo reformulando.\n\n"
            f"O JSON deve ter exatamente estas chaves:\n"
            f"  - \"stem\": A pergunta.\n"
            f"  - \"options\": Lista de 4 strings.\n"
            f"  - \"correct_index\": Indice (0-3) da opcao correta.\n"
            f"  - \"solution\": Explicacao concisa da resposta correta.\n"
            f"  - \"difficulty\": Float entre 0.55 e 0.85.\n"
        )
        if original_question_id and incorrect_answer:
            user_prompt += (
                f"\nO aluno errou a questao '{original_question_id}' respondendo '{incorrect_answer}'. "
                f"Gere uma questao que ajude a sanar essa lacuna de conhecimento, "
                f"mas abordando o conceito por um ANGULO DIFERENTE — outro sub-topico, outro tipo de raciocinio."
            )
        if previous_stems:
            user_prompt += (
                f"\n\nQUESTOES JA GERADAS (NAO repita, NAO reformule, NAO use o mesmo tema/padrao):\n"
                + "\n".join(f"- {s}" for s in previous_stems)
                + "\n\nA nova questao DEVE cobrir um aspecto do topico que NENHUMA das questoes acima aborda."
            )

        api_messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]
        data = self._call_api(api_messages, _MAX_TOKENS * 2, temperature=0.7)

        try:
            raw_content = data["choices"][0]["message"]["content"].strip()
            if raw_content.startswith("```"):
                raw_content = raw_content.split("\n", 1)[1].rsplit("```", 1)[0].strip()
            generated_data = json.loads(raw_content)
            q_id = f"gen-{concept_id}-{uuid.uuid4().hex[:8]}"
            raw_diff = float(generated_data.get("difficulty", 0.6))
            difficulty = max(0.55, min(1.0, raw_diff))
            result = GeneratedQuestion(
                id=q_id,
                stem=generated_data["stem"],
                options=tuple(generated_data["options"]),
                correct_index=generated_data["correct_index"],
                solution=generated_data["solution"],
                difficulty=difficulty,
            )
            log.info("Generated question id=%s for concept=%s", q_id, concept_id)
            return result
        except (KeyError, IndexError, AttributeError, json.JSONDecodeError) as e:
            log.error("Failed to parse generated question: %s. Raw response: %s", e, data)
            raise RuntimeError(f"Resposta malformada do tutor: {e}") from e

