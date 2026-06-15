from app.domain import mastery as m
from app.domain.models import Level


def test_correct_answer_raises_mastery():
    assert m.update(0.5, correct=True, difficulty=0.8) > 0.5


def test_wrong_answer_lowers_mastery():
    assert m.update(0.5, correct=False, difficulty=0.8) < 0.5


def test_clamped_to_unit_interval():
    assert m.update(1.0, correct=True, difficulty=0.8) <= 1.0
    assert m.update(0.0, correct=False, difficulty=0.8) >= 0.0


def test_harder_correct_moves_more_than_easier():
    easy = m.update(0.5, correct=True, difficulty=0.30)
    hard = m.update(0.5, correct=True, difficulty=0.80)
    assert hard > easy


def test_level_thresholds():
    assert m.level_of(0.0) is Level.INICIANTE
    assert m.level_of(0.39) is Level.INICIANTE
    assert m.level_of(0.40) is Level.EM_PROGRESSO
    assert m.level_of(0.74) is Level.EM_PROGRESSO
    assert m.level_of(0.75) is Level.DOMINADO
    assert m.level_of(1.0) is Level.DOMINADO


def test_percent_rounds():
    assert m.percent_of(0.617) == 62
    assert m.percent_of(0.0) == 0
    assert m.percent_of(1.0) == 100
