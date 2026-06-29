from app.domain.models import Concept
from app.domain.recommendation import compute_unlocked_set, is_unlocked, recommend


def _c(cid, prereqs=()):
    return Concept(id=cid, title=cid, unit=0, topic=1, content="", prerequisites=tuple(prereqs))


CONCEPTS = [_c("a"), _c("b", ["a"]), _c("c", ["b"])]


def test_root_is_always_unlocked():
    assert is_unlocked(CONCEPTS[0], {}) is True


def test_locked_until_prereq_passes_gate():
    assert is_unlocked(CONCEPTS[1], {"a": 0.59}) is False
    assert is_unlocked(CONCEPTS[1], {"a": 0.60}) is True


def test_recommend_picks_lowest_unlocked_non_mastered():
    masteries = {"a": 0.8, "b": 0.5}  # a mastered, b unlocked & weakest
    next_id, _ = recommend(CONCEPTS, masteries)
    assert next_id == "b"


def test_recommend_respects_prerequisites():
    # nothing learned yet -> only the root is unlocked
    next_id, _ = recommend(CONCEPTS, {})
    assert next_id == "a"


def test_recommend_complete_returns_none():
    masteries = {"a": 0.9, "b": 0.9, "c": 0.9}
    next_id, reason = recommend(CONCEPTS, masteries)
    assert next_id is None
    assert "concluído" in reason.lower()


def test_compute_unlocked_set_transitive():
    masteries = {"a": 0.0, "b": 0.7}
    unlocked = compute_unlocked_set(CONCEPTS, masteries)
    assert unlocked == frozenset({"a"})


def test_recommend_respects_transitive_lock():
    masteries = {"a": 0.0, "b": 0.7}
    next_id, _ = recommend(CONCEPTS, masteries)
    assert next_id == "a"
