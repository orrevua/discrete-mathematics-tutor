"""Initial diagnostic: broad questions spanning the 4 parts of the course.

Each is tagged with the `concept_id` it informs; answers seed initial mastery
from a neutral prior. Independent of block questions so those stay unseen.
Coverage: Conteúdo Transversal + Unidade 1/2/3.
"""
from __future__ import annotations

from app.domain.models import Question


def q(qid: str, concept_id: str, stem: str, options: list[str], correct: int, diff: float) -> Question:
    return Question(
        id=qid,
        concept_id=concept_id,
        stem=stem,
        options=tuple(options),
        correct_index=correct,
        difficulty=diff,
    )


DIAGNOSTIC: tuple[Question, ...] = (
    # Conteúdo Transversal
    q("diag-1", "dem-direta",
      "Para provar diretamente que 'a soma de dois ímpares é par', você escreveria os números como:",
      ["2a e 2b", "2a+1 e 2b+1", "a/2 e b/2", "a² e b²"], 1, 0.30),
    q("diag-2", "dem-contrapos",
      "Qual frase é **logicamente equivalente** a 'se chove, a rua fica molhada'?",
      ["Se a rua está molhada, choveu",
       "Se a rua não está molhada, não choveu",
       "Se não chove, a rua não molha",
       "Chove e a rua não molha"], 1, 0.55),
    q("diag-3", "inducao",
      "Numa prova por indução sobre ℕ, a etapa mais comumente esquecida é:",
      ["enunciar a tese", "provar o caso base", "usar números reais", "escrever a recíproca"], 1, 0.30),
    # Unidade 1
    q("diag-4", "conj-basico",
      "A cardinalidade de `{∅, {∅}}` é:",
      ["0", "1", "2", "3"], 2, 0.55),
    q("diag-5", "conj-operacoes",
      "Se `A = {1,2,3}` e `B = {2,3,4}`, então `A − B` é:",
      ["{2,3}", "{1}", "{4}", "{1,2,3,4}"], 1, 0.30),
    q("diag-6", "fun-injetora",
      "A função `f(x) = x²` de ℝ em ℝ não é injetora porque:",
      ["não tem imagem para alguns x", "f(−2) = f(2) com −2 ≠ 2",
       "não atinge o valor 4", "é crescente"], 1, 0.55),
    q("diag-7", "fun-sobre-bij",
      "Uma função é bijetora se e somente se é:",
      ["injetora ou sobrejetora", "injetora e sobrejetora", "constante", "crescente"], 1, 0.55),
    q("diag-8", "seq-sequencias",
      "A sequência `2, 6, 18, 54, …` é uma PG de razão:",
      ["2", "3", "4", "6"], 1, 0.30),
    q("diag-9", "card-pcp",
      "Quantas pessoas garantem, pelo Princípio da Casa dos Pombos, que duas nasceram no mesmo mês?",
      ["12", "13", "24", "30"], 1, 0.55),
    # Unidade 2
    q("diag-10", "rel-propriedades",
      "A relação `≤` em ℤ é reflexiva, antissimétrica e transitiva, mas NÃO é:",
      ["reflexiva", "transitiva", "simétrica", "antissimétrica"], 2, 0.55),
    q("diag-11", "rel-equivalencia",
      "Agrupar pessoas pelo mês de nascimento define uma relação de:",
      ["ordem total", "equivalência", "ordem parcial estrita", "função bijetora"], 1, 0.55),
    q("diag-12", "rel-ordem",
      "A relação `⊆` sobre `P({1,2})` é uma ordem parcial (não total) porque:",
      ["não é transitiva", "{1} e {2} são incomparáveis", "não é reflexiva", "tem ciclos"], 1, 0.80),
    # Unidade 3
    q("diag-13", "alg-hasse",
      "Num diagrama de Hasse, **não** se desenham:",
      ["os elementos", "os laços reflexivos e as arestas de transitividade",
       "as coberturas", "os níveis"], 1, 0.55),
    q("diag-14", "alg-reticulados",
      "Um reticulado é um poset em que todo par de elementos tem:",
      ["apenas supremo", "supremo e ínfimo", "um complemento", "apenas um minimal"], 1, 0.80),
)
