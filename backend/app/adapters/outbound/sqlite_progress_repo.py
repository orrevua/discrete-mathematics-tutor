"""SQLite adapter for ProgressRepository (stdlib sqlite3, no ORM).

Per-user progress (keyed by user_id). Short-lived connection per call (safe for
the dev server). Reset by deleting the DB file or calling reset(user_id).
"""
from __future__ import annotations

import json
import sqlite3
from pathlib import Path

_SCHEMA = """
CREATE TABLE IF NOT EXISTS mastery (
  user_id    TEXT NOT NULL,
  concept_id TEXT NOT NULL,
  mastery    REAL NOT NULL DEFAULT 0.0,
  PRIMARY KEY (user_id, concept_id)
);
CREATE TABLE IF NOT EXISTS answer_log (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      TEXT NOT NULL,
  question_id  TEXT NOT NULL,
  concept_id   TEXT NOT NULL,
  selected_idx INTEGER NOT NULL,
  correct      INTEGER NOT NULL,
  source       TEXT NOT NULL,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
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
  difficulty           REAL NOT NULL,
  selected_index       INTEGER,
  correct              INTEGER,
  created_at           TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, question_id)
);
"""


class SqliteProgressRepository:
    """Implements the ProgressRepository port."""

    def __init__(self, db_path: str | Path) -> None:
        self._db_path = str(db_path)
        self._init_schema()

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self._db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_schema(self) -> None:
        with self._connect() as conn:
            conn.executescript(_SCHEMA)

    def get_all_mastery(self, user_id: str) -> dict[str, float]:
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT concept_id, mastery FROM mastery WHERE user_id = ?", (user_id,)
            ).fetchall()
        return {r["concept_id"]: r["mastery"] for r in rows}

    def get_mastery(self, user_id: str, concept_id: str, default: float = 0.0) -> float:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT mastery FROM mastery WHERE user_id = ? AND concept_id = ?",
                (user_id, concept_id),
            ).fetchone()
        return row["mastery"] if row else default

    def set_mastery(self, user_id: str, concept_id: str, value: float) -> None:
        with self._connect() as conn:
            conn.execute(
                "INSERT INTO mastery (user_id, concept_id, mastery) VALUES (?, ?, ?) "
                "ON CONFLICT(user_id, concept_id) DO UPDATE SET mastery = excluded.mastery",
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
                "VALUES (?, ?, ?, ?, ?, ?)",
                (user_id, question_id, concept_id, selected_idx, int(correct), source),
            )
            conn.commit()

    def get_answered_questions(
        self, user_id: str, concept_id: str, source: str
    ) -> list[dict]:
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT question_id, selected_idx, correct FROM answer_log "
                "WHERE user_id = ? AND concept_id = ? AND source = ? "
                "ORDER BY created_at ASC",
                (user_id, concept_id, source),
            ).fetchall()
        seen: dict[str, dict] = {}
        for r in rows:
            qid = r["question_id"]
            if qid not in seen:
                seen[qid] = {
                    "question_id": qid,
                    "selected_idx": r["selected_idx"],
                    "correct": bool(r["correct"]),
                }
        return list(seen.values())

    def is_diagnostic_done(self, user_id: str) -> bool:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT value FROM meta WHERE user_id = ? AND key = 'diagnostic_done'",
                (user_id,),
            ).fetchone()
        return bool(row) and row["value"] == "true"

    def mark_diagnostic_done(self, user_id: str) -> None:
        with self._connect() as conn:
            conn.execute(
                "INSERT INTO meta (user_id, key, value) VALUES (?, 'diagnostic_done', 'true') "
                "ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value",
                (user_id,),
            )
            conn.commit()

    def reset(self, user_id: str) -> None:
        with self._connect() as conn:
            conn.execute("DELETE FROM mastery WHERE user_id = ?", (user_id,))
            conn.execute("DELETE FROM answer_log WHERE user_id = ?", (user_id,))
            conn.execute("DELETE FROM meta WHERE user_id = ?", (user_id,))
            conn.execute("DELETE FROM generated_questions WHERE user_id = ?", (user_id,))
            conn.commit()

    def clear_diagnostic_status(self, user_id: str) -> None:
        with self._connect() as conn:
            conn.execute(
                "DELETE FROM meta WHERE user_id = ? AND key = 'diagnostic_done'",
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
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) "
                "ON CONFLICT(user_id, question_id) DO UPDATE SET "
                "selected_index = excluded.selected_index, correct = excluded.correct",
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
                "WHERE user_id = ? AND concept_id = ? ORDER BY created_at ASC",
                (user_id, concept_id),
            ).fetchall()
        result = []
        for r in rows:
            result.append({
                "original_question_id": r["original_question_id"],
                "question_id": r["question_id"],
                "stem": r["stem"],
                "options": json.loads(r["options"]),
                "correct_index": r["correct_index"],
                "solution": r["solution"],
                "difficulty": r["difficulty"],
                "selected_index": r["selected_index"],
                "correct": bool(r["correct"]) if r["correct"] is not None else None,
            })
        return result
