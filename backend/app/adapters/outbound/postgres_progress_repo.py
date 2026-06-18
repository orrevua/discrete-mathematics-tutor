"""Postgres adapter for ProgressRepository (psycopg 3).

Per-user progress, persistent for deployment on ephemeral hosts (e.g. Render
free tier) backed by managed Postgres (e.g. Neon). Selected at the composition
root when DATABASE_URL is set; SQLite remains the local default. Short-lived
connection per call -- fine for this scale.
"""
from __future__ import annotations

import json

import psycopg

_SCHEMA = """
CREATE TABLE IF NOT EXISTS mastery (
  user_id    TEXT NOT NULL,
  concept_id TEXT NOT NULL,
  mastery    DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  PRIMARY KEY (user_id, concept_id)
);
CREATE TABLE IF NOT EXISTS answer_log (
  id           SERIAL PRIMARY KEY,
  user_id      TEXT NOT NULL,
  question_id  TEXT NOT NULL,
  concept_id   TEXT NOT NULL,
  selected_idx INTEGER NOT NULL,
  correct      INTEGER NOT NULL,
  source       TEXT NOT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_answer_log_user ON answer_log(user_id);
CREATE TABLE IF NOT EXISTS meta (
  user_id TEXT NOT NULL,
  key     TEXT NOT NULL,
  value   TEXT NOT NULL,
  PRIMARY KEY (user_id, key)
);
CREATE TABLE IF NOT EXISTS generated_questions (
  user_id              TEXT NOT NULL,
  concept_id           TEXT NOT NULL,
  original_question_id TEXT NOT NULL,
  question_id          TEXT NOT NULL,
  stem                 TEXT NOT NULL,
  options              TEXT NOT NULL,
  correct_index        INTEGER NOT NULL,
  solution             TEXT NOT NULL,
  difficulty           DOUBLE PRECISION NOT NULL,
  selected_index       INTEGER,
  correct              INTEGER,
  created_at           TIMESTAMP NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, question_id)
);
"""


class PostgresProgressRepository:
    """Implements the ProgressRepository port against Postgres."""

    def __init__(self, dsn: str) -> None:
        self._dsn = dsn
        self._init_schema()

    def _connect(self) -> psycopg.Connection:
        return psycopg.connect(self._dsn)

    def _init_schema(self) -> None:
        with self._connect() as conn:
            conn.execute(_SCHEMA)
            conn.commit()

    def get_all_mastery(self, user_id: str) -> dict[str, float]:
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT concept_id, mastery FROM mastery WHERE user_id = %s", (user_id,)
            ).fetchall()
        return {r[0]: r[1] for r in rows}

    def get_mastery(self, user_id: str, concept_id: str, default: float = 0.0) -> float:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT mastery FROM mastery WHERE user_id = %s AND concept_id = %s",
                (user_id, concept_id),
            ).fetchone()
        return row[0] if row else default

    def set_mastery(self, user_id: str, concept_id: str, value: float) -> None:
        with self._connect() as conn:
            conn.execute(
                "INSERT INTO mastery (user_id, concept_id, mastery) VALUES (%s, %s, %s) "
                "ON CONFLICT (user_id, concept_id) DO UPDATE SET mastery = EXCLUDED.mastery",
                (user_id, concept_id, value),
            )
            conn.commit()

    def log_answer(
        self,
        user_id: str,
        question_id: str,
        concept_id: str,
        selected_idx: int,
        correct: bool,
        source: str,
    ) -> None:
        with self._connect() as conn:
            conn.execute(
                "INSERT INTO answer_log "
                "(user_id, question_id, concept_id, selected_idx, correct, source) "
                "VALUES (%s, %s, %s, %s, %s, %s)",
                (user_id, question_id, concept_id, selected_idx, int(correct), source),
            )
            conn.commit()

    def get_answered_questions(
        self, user_id: str, concept_id: str, source: str
    ) -> list[dict]:
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT question_id, selected_idx, correct FROM answer_log "
                "WHERE user_id = %s AND concept_id = %s AND source = %s "
                "ORDER BY created_at ASC",
                (user_id, concept_id, source),
            ).fetchall()
        seen: dict[str, dict] = {}
        for r in rows:
            qid = r[0]
            if qid not in seen:
                seen[qid] = {
                    "question_id": qid,
                    "selected_idx": r[1],
                    "correct": bool(r[2]),
                }
        return list(seen.values())

    def is_diagnostic_done(self, user_id: str) -> bool:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT value FROM meta WHERE user_id = %s AND key = 'diagnostic_done'",
                (user_id,),
            ).fetchone()
        return bool(row) and row[0] == "true"

    def mark_diagnostic_done(self, user_id: str) -> None:
        with self._connect() as conn:
            conn.execute(
                "INSERT INTO meta (user_id, key, value) VALUES (%s, 'diagnostic_done', 'true') "
                "ON CONFLICT (user_id, key) DO UPDATE SET value = EXCLUDED.value",
                (user_id,),
            )
            conn.commit()

    def reset(self, user_id: str) -> None:
        with self._connect() as conn:
            conn.execute("DELETE FROM mastery WHERE user_id = %s", (user_id,))
            conn.execute("DELETE FROM answer_log WHERE user_id = %s", (user_id,))
            conn.execute("DELETE FROM meta WHERE user_id = %s", (user_id,))
            conn.execute("DELETE FROM generated_questions WHERE user_id = %s", (user_id,))
            conn.commit()

    def clear_diagnostic_status(self, user_id: str) -> None:
        with self._connect() as conn:
            conn.execute(
                "DELETE FROM meta WHERE user_id = %s AND key = 'diagnostic_done'",
                (user_id,),
            )
            conn.commit()

    def save_generated_question(
        self, user_id: str, concept_id: str, original_question_id: str,
        question_id: str, stem: str, options: list[str], correct_index: int,
        solution: str, difficulty: float, selected_index: int, correct: bool,
    ) -> None:
        with self._connect() as conn:
            conn.execute(
                "INSERT INTO generated_questions "
                "(user_id, concept_id, original_question_id, question_id, stem, options, "
                "correct_index, solution, difficulty, selected_index, correct) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) "
                "ON CONFLICT (user_id, question_id) DO UPDATE SET "
                "selected_index = EXCLUDED.selected_index, correct = EXCLUDED.correct",
                (user_id, concept_id, original_question_id, question_id, stem,
                 json.dumps(options), correct_index, solution, difficulty,
                 selected_index, int(correct)),
            )
            conn.commit()

    def get_generated_questions(self, user_id: str, concept_id: str) -> list[dict]:
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT original_question_id, question_id, stem, options, correct_index, "
                "solution, difficulty, selected_index, correct FROM generated_questions "
                "WHERE user_id = %s AND concept_id = %s ORDER BY created_at ASC",
                (user_id, concept_id),
            ).fetchall()
        result = []
        for r in rows:
            result.append({
                "original_question_id": r[0],
                "question_id": r[1],
                "stem": r[2],
                "options": json.loads(r[3]),
                "correct_index": r[4],
                "solution": r[5],
                "difficulty": r[6],
                "selected_index": r[7],
                "correct": bool(r[8]) if r[8] is not None else None,
            })
        return result
