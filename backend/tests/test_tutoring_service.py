"""Service tests using a fake in-memory ProgressRepository — proving the ports
decouple the application from SQLite (no DB needed to test use cases).
"""
from app.application.tutoring_service import TutoringService
from app.domain.models import Concept, Question
from app.ports.tutor import TutorPort
from app.application.dto import GeneratedQuestion, ChatMessage


class FakeTutor(TutorPort):
    def is_configured(self) -> bool:
        return True

    def reply(self, system_prompt: str, messages: Sequence[ChatMessage]) -> str:
        return "Fake tutor reply"

    def generate_question(
        self,
        concept_content: str,
        concept_id: str,
        original_question_id: str | None = None,
        incorrect_answer: str | None = None,
    ) -> GeneratedQuestion:
        return GeneratedQuestion(
            id="gen-fake-q1",
            stem="Fake generated question",
            options=("a", "b", "c", "d"),
            correct_index=0,
            solution="Fake solution",
            difficulty=0.5,
        )


class FakeProgress:
    """In-memory fake scoped by user_id (mirrors the per-user port)."""

    def __init__(self):
        self.mastery: dict[str, dict[str, float]] = {}
        self.log: list[tuple] = []
        self.done: set[str] = set()

    def get_all_mastery(self, user_id):
        return dict(self.mastery.get(user_id, {}))

    def get_mastery(self, user_id, concept_id, default=0.0):
        return self.mastery.get(user_id, {}).get(concept_id, default)

    def set_mastery(self, user_id, concept_id, value):
        self.mastery.setdefault(user_id, {})[concept_id] = value

    def log_answer(self, user_id, question_id, concept_id, selected_idx, correct, source):
        self.log.append((user_id, question_id, concept_id, selected_idx, correct, source))

    def is_diagnostic_done(self, user_id):
        return user_id in self.done

    def mark_diagnostic_done(self, user_id):
        self.done.add(user_id)

    def get_answered_questions(self, user_id, concept_id, source):
        seen: dict[str, dict] = {}
        for uid, qid, cid, sel, correct, src in self.log:
            if uid == user_id and cid == concept_id and src == source and qid not in seen:
                seen[qid] = {"question_id": qid, "selected_idx": sel, "correct": correct}
        return list(seen.values())

    def reset(self, user_id):
        self.mastery.pop(user_id, None)
        self.log = [r for r in self.log if r[0] != user_id]
        self.done.discard(user_id)


class FakeContent:
    def __init__(self, concepts, diagnostic=()):
        self._concepts = tuple(concepts)
        self._by_id = {c.id: c for c in concepts}
        self._diag = tuple(diagnostic)

    def all_concepts(self):
        return self._concepts

    def get_concept(self, concept_id):
        return self._by_id.get(concept_id)

    def diagnostic_questions(self):
        return self._diag


def _question(qid, concept_id, correct=0, diff=0.55):
    return Question(
        id=qid, concept_id=concept_id, stem="?",
        options=("a", "b", "c", "d"), correct_index=correct, difficulty=diff,
    )


def _block(cid):
    qs = tuple(_question(f"{cid}-q{i}", cid) for i in range(1, 4))
    return Concept(id=cid, title=cid, unit=0, topic=1, content="x", prerequisites=(), questions=qs)


def test_submit_block_answers_updates_mastery_and_grades():
    content = FakeContent([_block("a")])
    progress = FakeProgress()
    svc = TutoringService(content, progress, tutor=FakeTutor())

    result = svc.submit_block_answers("u1", "a", [("a-q1", 0), ("a-q2", 1)])

    assert result.results[0].correct is True   # selected the correct index 0
    assert result.results[1].correct is False  # correct is 0, selected 1
    assert progress.get_mastery("u1", "a") > 0.0     # mastery moved
    assert len(progress.log) == 2


def test_submit_diagnostic_marks_done_and_seeds():
    diag = [_question("diag-1", "a", correct=0)]
    content = FakeContent([_block("a")], diagnostic=diag)
    progress = FakeProgress()
    svc = TutoringService(content, progress, tutor=FakeTutor())

    overview = svc.submit_diagnostic("u1", [("diag-1", 0)])

    assert progress.is_diagnostic_done("u1") is True
    assert progress.get_mastery("u1", "a") > 0.5  # correct hard-ish answer from 0.5 prior
    assert overview.global_percent >= 0


def test_progress_is_isolated_per_user():
    content = FakeContent([_block("a")])
    progress = FakeProgress()
    svc = TutoringService(content, progress, tutor=FakeTutor())

    svc.submit_block_answers("u1", "a", [("a-q1", 0)])
    # u2 has not answered anything → independent, empty progress
    assert svc.get_mastery_overview("u2").global_percent == 0
    assert svc.get_mastery_overview("u1").global_percent >= 0


def test_get_block_unknown_raises():
    from app.application.errors import ConceptNotFound
    import pytest

    svc = TutoringService(FakeContent([_block("a")]), FakeProgress(), tutor=FakeTutor())
    with pytest.raises(ConceptNotFound):
        svc.get_block("nope")
