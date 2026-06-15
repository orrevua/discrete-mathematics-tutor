"""Unidade 3 — Elementos de Álgebra.

Baseado em Kolman/Busby/Ross e Epp (livros 5 e 6 do plano da Unidade 3) e Menezes.
unit = 3. topics: 9 = Hasse e Ordens, 10 = Reticulados e Booleana.
"""
from __future__ import annotations

from app.seed.blocks._shared import EASY, HARD, MEDIUM, concept, graded, practice

UNIDADE_3 = (
    # ───────────────────── Hasse e Ordens (topic 9) ─────────────────────
    concept(
        id="alg-hasse",
        title="Diagrama de Hasse",
        unit=3,
        topic=9,
        prerequisites=("rel-ordem",),
        content="""## Intuição
O **diagrama de Hasse** desenha uma ordem parcial sem poluição visual: omite os laços (reflexividade) e as setas implicadas por transitividade, e orienta tudo "de baixo para cima". Fica só o essencial: quem cobre quem.

## Definição formal
Dado um poset `(A, ≤)`, no diagrama de Hasse:
1. cada elemento é um ponto;
2. se `a ≤ b` e `a ≠ b` e não há `c` "no meio" (`a < c < b`), desenha-se `b` **acima** de `a` ligados por um segmento (dizemos que `b` **cobre** `a`);
3. não se desenham laços nem arestas de transitividade.

## Exemplo resolvido
Em `(P({a,b}), ⊆)`: `∅` embaixo; `{a}` e `{b}` no nível do meio (ligados a `∅`); `{a,b}` no topo (ligado a `{a}` e `{b}`). Não se liga `∅` a `{a,b}` diretamente — isso vem por transitividade.

## Erros comuns
- Desenhar os laços `(a,a)` ou as arestas de transitividade.
- Inverter a orientação (o "maior" fica em cima).""",
        questions=(
            graded("alg-hasse-q1", "alg-hasse",
                   "Num diagrama de Hasse, **não** se desenham:",
                   ["os elementos", "os laços reflexivos e as arestas de transitividade",
                    "as coberturas", "os níveis"], 1,
                   "O Hasse omite reflexividade (laços) e arestas implicadas por transitividade, mostrando só as coberturas.",
                   EASY),
            graded("alg-hasse-q2", "alg-hasse",
                   "Dizemos que `b` **cobre** `a` quando:",
                   ["a ≤ b e existe c com a < c < b",
                    "a < b e não há c com a < c < b",
                    "a = b",
                    "b ≤ a"], 1,
                   "Cobertura: b está imediatamente acima de a, sem elementos intermediários.",
                   MEDIUM),
            graded("alg-hasse-q3", "alg-hasse",
                   "No Hasse de `(P({a,b}), ⊆)`, no topo fica:",
                   ["∅", "{a}", "{b}", "{a,b}"], 3,
                   "{a,b} contém todos os outros, então é o maior — fica no topo.",
                   MEDIUM),
            graded("alg-hasse-q4", "alg-hasse",
                   "Quantas arestas tem o diagrama de Hasse de `(P({a,b,c}), ⊆)`?",
                   ["6", "12", "8", "3"], 1,
                   "P({a,b,c}) tem 8 elementos. As coberturas ligam conjuntos que diferem por exatamente 1 elemento: "
                   "3 arestas de ∅ para singletons, 6 de singletons para pares, 3 de pares para {a,b,c} = 12 coberturas.",
                   HARD),
            graded("alg-hasse-q5", "alg-hasse",
                   "No Hasse de `({1,2,3,4,6,12}, |)` (divisibilidade), `6` cobre:",
                   ["1 e 12", "2 e 3", "4 e 6", "1 e 6"], 1,
                   "6 = 2·3; os divisores próprios imediatos são 2 e 3 (não há d com 2|d|6 além do próprio 6). Logo 6 cobre 2 e 3.",
                   HARD),
            graded("alg-hasse-q6", "alg-hasse",
                   "No Hasse de `(P({a}), ⊆)`, quantos níveis existem?",
                   ["1", "2", "3", "4"], 1,
                   "P({a}) = {∅, {a}}: ∅ embaixo e {a} em cima — exatamente 2 níveis.",
                   EASY),
            graded("alg-hasse-q7", "alg-hasse",
                   "Se `(A, ≤)` é uma ordem **total** finita com `n` elementos, o diagrama de Hasse é:",
                   ["um grafo completo", "uma cadeia (linha reta vertical)",
                    "um losango", "um grafo sem arestas"], 1,
                   "Numa ordem total, todo par é comparável e as coberturas formam uma sequência linear: a₁ < a₂ < … < aₙ.",
                   MEDIUM),
        ),
        practice=(
            practice("alg-hasse-p1", "alg-hasse",
                     "A orientação padrão do diagrama de Hasse coloca elementos maiores:",
                     ["embaixo", "acima", "à esquerda", "em círculo"], 1,
                     "Convenção: se a ≤ b, b é desenhado acima de a.",
                     EASY),
            practice("alg-hasse-p2", "alg-hasse",
                     "No Hasse, a aresta direta entre ∅ e {a,b} (em P({a,b}), ⊆):",
                     ["é desenhada", "é omitida (vem por transitividade)",
                      "é um laço", "indica incomparabilidade"], 1,
                     "∅ ⊆ {a,b} decorre de ∅ ⊆ {a} ⊆ {a,b}; por transitividade, a aresta direta é omitida.",
                     MEDIUM),
            practice("alg-hasse-p3", "alg-hasse",
                     "O diagrama de Hasse representa qual tipo de relação?",
                     ["equivalência", "ordem parcial",
                      "função", "relação simétrica"], 1,
                     "O Hasse é a representação visual de um poset (ordem parcial).",
                     EASY),
            practice("alg-hasse-p4", "alg-hasse",
                     "No Hasse de `({1,2,3,5,6,10,15,30}, |)`, o elemento `30` fica:",
                     ["no meio", "embaixo", "no topo", "isolado"], 2,
                     "30 é múltiplo de todos os demais elementos do conjunto, logo é o maior — fica no topo do diagrama.",
                     EASY),
            practice("alg-hasse-p5", "alg-hasse",
                     "No Hasse de `(P({a,b,c}), ⊆)`, `{a}` e `{b}` estão ligados por aresta?",
                     ["Sim, pois ambos são singletons",
                      "Não, pois nenhum é subconjunto do outro",
                      "Sim, pois sua união é {a,b}",
                      "Não, pois são iguais"], 1,
                     "{a} ⊄ {b} e {b} ⊄ {a}: são incomparáveis, portanto não há aresta entre eles no Hasse.",
                     MEDIUM),
            practice("alg-hasse-p6", "alg-hasse",
                     "No Hasse de `({1,2,4,8}, |)`, `4` cobre `2`. Isso significa que:",
                     ["2 | 4 e não existe d com 2 | d | 4 no conjunto",
                      "4 < 2",
                      "2 e 4 são incomparáveis",
                      "4 divide 2"], 0,
                     "Cobertura: 2 divide 4 e não há elemento intermediário no conjunto (3 ∉ A). Logo 4 cobre 2.",
                     HARD),
        ),
    ),
    concept(
        id="alg-isomorfismo",
        title="Isomorfismo de ordens parciais",
        unit=3,
        topic=9,
        prerequisites=("alg-hasse", "fun-sobre-bij"),
        content="""## Intuição
Duas ordens parciais são **isomorfas** quando têm "a mesma forma": existe um renomeio (bijeção) dos elementos que preserva a relação de ordem nos dois sentidos. Seus diagramas de Hasse são idênticos a menos dos rótulos.

## Definição formal
Sejam `(A, R)` e `(A', R')` posets e `f: A → A'` uma **bijeção**. `f` é um **isomorfismo** se, para quaisquer `a, b ∈ A`:
`a R b ⟺ f(a) R' f(b)`.
Nesse caso `(A,R)` e `(A',R')` são **isomorfas**.

## Exemplo resolvido
`(P({a}), ⊆)` — com `∅ ⊆ {a}` — é isomorfa a `({0,1}, ≤)` via `f(∅)=0`, `f({a})=1`: `∅ ⊆ {a}` ⟺ `0 ≤ 1`. Mesmos diagramas de Hasse (dois pontos, um acima do outro).

## Erros comuns
- Pedir só que `f` seja função (precisa ser **bijeção**).
- Exigir preservação só numa direção (`a R b → f(a) R' f(b)`); o isomorfismo é **se e somente se**.""",
        questions=(
            graded("alg-isomorfismo-q1", "alg-isomorfismo",
                   "Um isomorfismo de ordens parciais é uma **bijeção** `f` tal que:",
                   ["a R b → f(a) R' f(b) apenas",
                    "a R b ⟺ f(a) R' f(b)",
                    "f(a) = a",
                    "f preserva apenas a reflexividade"], 1,
                   "Isomorfismo preserva a ordem nos dois sentidos: a R b se e somente se f(a) R' f(b).",
                   MEDIUM),
            graded("alg-isomorfismo-q2", "alg-isomorfismo",
                   "Para `f` ser isomorfismo de ordens, ela precisa ser, no mínimo, uma:",
                   ["função qualquer", "bijeção",
                    "injeção não sobrejetora", "relação simétrica"], 1,
                   "Exige-se bijeção (renomeio 1-1 e sobre) que preserve a ordem.",
                   EASY),
            graded("alg-isomorfismo-q3", "alg-isomorfismo",
                   "Duas ordens isomorfas têm diagramas de Hasse:",
                   ["sempre diferentes", "idênticos a menos dos rótulos",
                    "sem relação", "com número diferente de elementos"], 1,
                   "Isomorfia preserva a estrutura: os Hasse coincidem, mudando só os nomes dos elementos.",
                   MEDIUM),
            graded("alg-isomorfismo-q4", "alg-isomorfismo",
                   "Se `(A, R)` tem 5 elementos e `(A', R')` tem 4, elas podem ser isomorfas?",
                   ["Sim, basta preservar a ordem",
                    "Não, pois não há bijeção entre conjuntos de tamanhos diferentes",
                    "Sim, se a ordem for total",
                    "Depende da relação"], 1,
                   "Isomorfismo exige bijeção, e bijeção só existe entre conjuntos de mesma cardinalidade.",
                   EASY),
            graded("alg-isomorfismo-q5", "alg-isomorfismo",
                   "Considere `({1,2,3}, ≤)` e `({a,b,c}, R')` com `a R' b R' c`. A função `f(1)=a, f(2)=b, f(3)=c` é isomorfismo se:",
                   ["R' for qualquer relação",
                    "R' for uma ordem parcial que reproduz exatamente a cadeia 1<2<3",
                    "f for sobrejetora apenas",
                    "R' for simétrica"], 1,
                   "Precisamos que i ≤ j ⟺ f(i) R' f(j). Como ≤ é total com 1<2<3, R' precisa ser a cadeia a<b<c.",
                   HARD),
            graded("alg-isomorfismo-q6", "alg-isomorfismo",
                   "Se `(A,R)` é isomorfa a `(A',R')` e `(A,R)` tem um máximo, então `(A',R'):`",
                   ["pode não ter máximo",
                    "também tem exatamente um máximo",
                    "tem dois maximais",
                    "não tem minimal"], 1,
                   "Isomorfismo preserva toda a estrutura de ordem. Se m é máximo de A, f(m) é máximo de A'.",
                   MEDIUM),
            graded("alg-isomorfismo-q7", "alg-isomorfismo",
                   "`({1,2,3,6}, |)` é isomorfa a `(P({a,b}), ⊆)` porque ambas:",
                   ["têm 4 elementos apenas",
                    "são ordens totais",
                    "têm o mesmo diagrama de Hasse (losango)",
                    "são álgebras booleanas"], 2,
                   "Ambas formam um losango no Hasse: um mínimo, dois elementos intermediários incomparáveis, um máximo. "
                   "A bijeção 1↦∅, 2↦{a}, 3↦{b}, 6↦{a,b} preserva a ordem.",
                   HARD),
        ),
        practice=(
            practice("alg-isomorfismo-p1", "alg-isomorfismo",
                     "`(P({a}), ⊆)` é isomorfa a:",
                     ["({0,1}, ≤)", "(ℤ, ≤)", "(ℕ, |)", "(∅, ∅)"], 0,
                     "Dois elementos com um abaixo do outro: ∅ ⊆ {a} ⟺ 0 ≤ 1.",
                     MEDIUM),
            practice("alg-isomorfismo-p2", "alg-isomorfismo",
                     "Se `f` preserva a ordem só numa direção, ela é:",
                     ["um isomorfismo", "não necessariamente um isomorfismo",
                      "sempre bijeção", "uma equivalência"], 1,
                     "Isomorfismo exige a bicondicional (⟺); só uma direção não basta.",
                     HARD),
            practice("alg-isomorfismo-p3", "alg-isomorfismo",
                     "Isomorfismo entre ordens parciais captura a ideia de:",
                     ["mesma cardinalidade só", "mesma estrutura de ordem",
                      "mesma soma", "relação inversa"], 1,
                     "É 'mesma forma' de ordenação, não apenas mesmo número de elementos.",
                     EASY),
            practice("alg-isomorfismo-p4", "alg-isomorfismo",
                     "Se `(A,R)` é isomorfa a `(A',R')`, então `|A|` e `|A'|` são:",
                     ["possivelmente diferentes", "iguais",
                      "ambos infinitos", "ambos primos"], 1,
                     "Bijeção implica mesma cardinalidade. Se |A| ≠ |A'|, não pode existir bijeção.",
                     EASY),
            practice("alg-isomorfismo-p5", "alg-isomorfismo",
                     "O número de elementos maximais é preservado por isomorfismo?",
                     ["Não", "Sim",
                      "Só em ordens totais", "Só em ordens finitas"], 1,
                     "Isomorfismo preserva toda propriedade definível pela relação de ordem, incluindo o número de maximais.",
                     MEDIUM),
            practice("alg-isomorfismo-p6", "alg-isomorfismo",
                     "Duas cadeias (ordens totais) finitas com o mesmo número de elementos são:",
                     ["nunca isomorfas", "sempre isomorfas",
                      "isomorfas só se tiverem os mesmos elementos", "incomparáveis"], 1,
                     "Cadeias finitas de mesmo tamanho n têm a mesma forma (sequência linear); basta mapear o i-ésimo menor para o i-ésimo menor.",
                     MEDIUM),
        ),
    ),
    concept(
        id="alg-extremos",
        title="Máximo/mínimo e maximal/minimal",
        unit=3,
        topic=9,
        prerequisites=("alg-hasse",),
        content="""## Intuição
Cuidado com a diferença sutil: **máximo** é o elemento que é ≥ **todos**; **maximal** é um elemento que não tem ninguém **acima** dele (mas pode haver elementos incomparáveis). Todo máximo é maximal, não o contrário.

## Definição formal
Num poset `(A, ≤)`:
- `m` é **máximo** se `a ≤ m` para todo `a ∈ A`. (Se existe, é **único**.)
- `m` é **mínimo** se `m ≤ a` para todo `a`. (Único, se existe.)
- `m` é **maximal** se não existe `a ≠ m` com `m ≤ a`.
- `m` é **minimal** se não existe `a ≠ m` com `a ≤ m`.
Num poset **finito não-vazio** há sempre pelo menos um maximal e um minimal.

## Exemplo resolvido
Em `({2,3,4,…}, |)` (divisibilidade, sem o 1): os primos `2,3,5,…` são todos **minimais** (nada os divide propriamente dentro do conjunto), mas **não** há mínimo (não há um número que divida todos). Mostra que pode haver vários minimais e nenhum mínimo.

## Erros comuns
- Confundir máximo (compara com todos) e maximal (ninguém acima).
- Assumir que máximo/mínimo sempre existem (maximal/minimal sim, em posets finitos não-vazios).""",
        questions=(
            graded("alg-extremos-q1", "alg-extremos",
                   "Um elemento `m` é **máximo** quando:",
                   ["não há ninguém acima dele",
                    "a ≤ m para todo a do conjunto",
                    "m ≤ a para todo a",
                    "é incomparável a todos"], 1,
                   "Máximo: maior que (ou igual a) TODOS. Difere de maximal (apenas 'ninguém acima').",
                   MEDIUM),
            graded("alg-extremos-q2", "alg-extremos",
                   "A diferença entre **maximal** e **máximo** é:",
                   ["são idênticos",
                    "maximal = ninguém acima; máximo = ≥ todos (compara com todos)",
                    "máximo pode não ser único",
                    "maximal é sempre único"], 1,
                   "Pode haver vários maximais (incomparáveis entre si); o máximo, se existe, é único e compara-se com todos.",
                   HARD),
            graded("alg-extremos-q3", "alg-extremos",
                   "Num poset **finito não-vazio**, é garantida a existência de:",
                   ["máximo", "ao menos um elemento maximal e um minimal",
                    "mínimo", "exatamente um maximal"], 1,
                   "Sempre há pelo menos um maximal e um minimal; máximo/mínimo podem não existir.",
                   MEDIUM),
            graded("alg-extremos-q4", "alg-extremos",
                   "Em `({2,3,5,7,10,15}, |)`, os elementos **minimais** são:",
                   ["{2,3,5,7}", "{10,15}", "{2}", "{7}"], 0,
                   "Minimais são os que não têm divisor próprio no conjunto. 2, 3, 5 e 7 são primos e nenhum outro "
                   "elemento do conjunto os divide (exceto eles mesmos). Já 10=2·5 e 15=3·5 têm divisores no conjunto.",
                   MEDIUM),
            graded("alg-extremos-q5", "alg-extremos",
                   "Em `(P({a,b,c}), ⊆)`, o **mínimo** do poset é:",
                   ["{a,b,c}", "{a}", "∅", "não existe"], 2,
                   "∅ ⊆ X para todo X ∈ P({a,b,c}), logo ∅ é o mínimo (está abaixo de todos).",
                   EASY),
            graded("alg-extremos-q6", "alg-extremos",
                   "Se um poset tem exatamente **um** elemento maximal, ele é necessariamente o máximo?",
                   ["Sim, sempre",
                    "Não necessariamente",
                    "Só em posets finitos",
                    "Só em ordens totais"], 0,
                   "Se há um único maximal m, então para todo a, ou a ≤ m ou a e m são incomparáveis. "
                   "Mas se existisse a incomparável a m, a teria que ter um maximal acima dele diferente de m — contradição. "
                   "Logo a ≤ m para todo a, e m é máximo.",
                   HARD),
            graded("alg-extremos-q7", "alg-extremos",
                   "Em `({1,2,3,4,6,12}, |)`, o elemento **máximo** é:",
                   ["1", "6", "12", "não existe"], 2,
                   "12 é múltiplo de todos os elementos do conjunto (1|12, 2|12, 3|12, 4|12, 6|12), logo 12 é o máximo.",
                   EASY),
        ),
        practice=(
            practice("alg-extremos-p1", "alg-extremos",
                     "Se um poset tem **máximo**, ele é:",
                     ["um entre vários", "único",
                      "igual ao mínimo", "incomparável aos demais"], 1,
                     "O máximo, quando existe, é único (por antissimetria).",
                     MEDIUM),
            practice("alg-extremos-p2", "alg-extremos",
                     "Todo máximo é maximal?",
                     ["Não", "Sim", "Só em ordens totais", "Só se for único"], 1,
                     "Se m é ≥ todos, ninguém está acima dele, logo é maximal. A recíproca falha.",
                     MEDIUM),
            practice("alg-extremos-p3", "alg-extremos",
                     "Um poset pode ter **vários** elementos maximais?",
                     ["Não, no máximo um", "Sim, se forem incomparáveis entre si",
                      "Só se for infinito", "Nunca"], 1,
                     "Elementos maximais incomparáveis coexistem (ex.: os primos sob divisibilidade).",
                     EASY),
            practice("alg-extremos-p4", "alg-extremos",
                     "Todo elemento **minimal** é também **mínimo**?",
                     ["Sim", "Não — minimal não exige comparabilidade com todos",
                      "Só em ordens totais", "Só em conjuntos finitos"], 1,
                     "Minimal = ninguém abaixo; mínimo = abaixo de TODOS. "
                     "Se houver elementos incomparáveis ao minimal, ele não é mínimo.",
                     MEDIUM),
            practice("alg-extremos-p5", "alg-extremos",
                     "Em `({2,3,4,6}, |)`, o poset possui máximo?",
                     ["Sim, é 6", "Sim, é 4",
                      "Não, pois 4 e 6 são incomparáveis", "Sim, é 12"], 2,
                     "4 ∤ 6 e 6 ∤ 4, então 4 e 6 são incomparáveis. Sem um elemento acima de todos, não há máximo.",
                     HARD),
            practice("alg-extremos-p6", "alg-extremos",
                     "Em uma **ordem total** finita não-vazia, o número de maximais é:",
                     ["0", "1", "n (todos)", "indeterminado"], 1,
                     "Numa ordem total, todos são comparáveis, então há exatamente um maximal que é também o máximo.",
                     EASY),
        ),
    ),
    concept(
        id="alg-limitantes",
        title="Limitantes, supremo e ínfimo",
        unit=3,
        topic=9,
        prerequisites=("alg-extremos",),
        content="""## Intuição
Para um subconjunto `B` de um poset, um **limitante superior** está acima de todo `B`; o **supremo** é o *menor* deles. Espelhando: **limitante inferior** abaixo de todo `B`; **ínfimo** é o *maior* deles.

## Definição formal
Seja `(A, ≤)` poset e `B ⊆ A`:
- `a` é **limitante superior** de `B` se `b ≤ a` para todo `b ∈ B`.
- `a` é **limitante inferior** de `B` se `a ≤ b` para todo `b ∈ B`.
- **Supremo** `sup B` = **menor** limitante superior (least upper bound).
- **Ínfimo** `inf B` = **maior** limitante inferior (greatest lower bound).
Supremo/ínfimo, quando existem, são únicos.

## Exemplo resolvido
No Hasse com `a, b` embaixo, `c` cobrindo ambos, e `d, e, f, g, h` acima: para `B = {c,d,e}`, os limitantes superiores são `f, g, h`; os inferiores são `c, a, b`; `inf B = c`. Para `B = {a,b}`, não há limitante inferior, e os superiores incluem `c, d, e, …`.

## Erros comuns
- Confundir limitante superior **qualquer** com o **supremo** (o menor deles).
- Procurar sup/inf dentro de `B` — eles vivem no poset `A`, podendo estar fora de `B`.""",
        questions=(
            graded("alg-limitantes-q1", "alg-limitantes",
                   "Um **limitante superior** de `B` é um elemento `a` tal que:",
                   ["a ≤ b para todo b ∈ B",
                    "b ≤ a para todo b ∈ B",
                    "a ∈ B",
                    "a é maximal"], 1,
                   "Limitante superior fica acima de todo B: b ≤ a para todo b ∈ B.",
                   MEDIUM),
            graded("alg-limitantes-q2", "alg-limitantes",
                   "O **supremo** de `B` é:",
                   ["qualquer limitante superior",
                    "o menor limitante superior",
                    "o maior elemento de B",
                    "um limitante inferior"], 1,
                   "sup B = menor limitante superior (least upper bound).",
                   MEDIUM),
            graded("alg-limitantes-q3", "alg-limitantes",
                   "O **ínfimo** de `B` é:",
                   ["o maior limitante inferior",
                    "o menor limitante inferior",
                    "o mínimo de A",
                    "qualquer cota inferior"], 0,
                   "inf B = maior limitante inferior (greatest lower bound).",
                   MEDIUM),
            graded("alg-limitantes-q4", "alg-limitantes",
                   "No poset do Hasse com `a,b` embaixo, `c` cobrindo ambos, e `f,g,h` acima de `d,e` (que cobrem `c`), "
                   "os limitantes superiores de `B = {c,d,e}` são:",
                   ["{c,a,b}", "{f,g,h}", "{d,e}", "{a,b,c,d,e,f,g,h}"], 1,
                   "Limitantes superiores de B ficam acima de todos os elementos de B. No Hasse descrito, f, g e h "
                   "estão acima de c, d e e.",
                   HARD),
            graded("alg-limitantes-q5", "alg-limitantes",
                   "Em `({1,2,3,4,6,12}, |)`, o `sup{2,3}` é:",
                   ["2", "3", "6", "12"], 2,
                   "sup{2,3} = mmc(2,3) = 6. Conferindo: 2|6 e 3|6, e 6 é o menor múltiplo comum no conjunto.",
                   MEDIUM),
            graded("alg-limitantes-q6", "alg-limitantes",
                   "Em `({1,2,3,4,6,12}, |)`, o `inf{4,6}` é:",
                   ["1", "2", "4", "12"], 1,
                   "inf{4,6} = mdc(4,6) = 2. Conferindo: 2|4 e 2|6, e 2 é o maior divisor comum no conjunto.",
                   MEDIUM),
            graded("alg-limitantes-q7", "alg-limitantes",
                   "Se `B` não possui nenhum limitante superior em `A`, então `sup B`:",
                   ["é 0", "é o máximo de A",
                    "não existe", "é o mínimo de B"], 2,
                   "O supremo é o menor limitante superior. Se não há limitante superior algum, o supremo não existe.",
                   EASY),
        ),
        practice=(
            practice("alg-limitantes-p1", "alg-limitantes",
                     "Supremo e ínfimo, quando existem, são:",
                     ["múltiplos", "únicos", "sempre elementos de B", "iguais"], 1,
                     "O menor limitante superior (e o maior inferior) é único.",
                     MEDIUM),
            practice("alg-limitantes-p2", "alg-limitantes",
                     "O supremo de `B` precisa pertencer a `B`?",
                     ["Sim, sempre", "Não necessariamente",
                      "Só em ordens totais", "Só se B é finito"], 1,
                     "sup B vive em A e pode estar fora de B (ex.: sup de (0,1) em ℝ é 1 ∉ (0,1)).",
                     HARD),
            practice("alg-limitantes-p3", "alg-limitantes",
                     "Em ℝ com ≤, o supremo do intervalo `[2, 5]` é:",
                     ["2", "5", "não existe", "7"], 1,
                     "5 é o menor limitante superior de [2,5] (e pertence ao conjunto).",
                     EASY),
            practice("alg-limitantes-p4", "alg-limitantes",
                     "Em `(ℕ, |)`, `inf{6,10}` é:",
                     ["60", "6", "2", "1"], 2,
                     "inf sob divisibilidade = mdc. mdc(6,10) = 2.",
                     MEDIUM),
            practice("alg-limitantes-p5", "alg-limitantes",
                     "Se `B = {a}` (singleton) num poset, então `sup B` é:",
                     ["o máximo de A", "o próprio a",
                      "não existe", "o mínimo de A"], 1,
                     "O menor elemento ≥ a é o próprio a (por reflexividade). Logo sup{a} = a.",
                     EASY),
            practice("alg-limitantes-p6", "alg-limitantes",
                     "Se `sup B` pertence a `B`, ele coincide com:",
                     ["o mínimo de B", "o máximo de B",
                      "um minimal de B", "o ínfimo de B"], 1,
                     "Se sup B ∈ B, então sup B é maior que todos de B e pertence a B — é o máximo de B.",
                     HARD),
        ),
    ),
    # ─────────────────── Reticulados e Booleana (topic 10) ───────────────────
    concept(
        id="alg-reticulados",
        title="Reticulados (lattices)",
        unit=3,
        topic=10,
        prerequisites=("alg-limitantes",),
        content="""## Intuição
Um **reticulado** é um poset onde **todo par** de elementos tem supremo e ínfimo. Ganhamos duas operações: `∨` (junção/supremo) e `∧` (encontro/ínfimo).

## Definição formal
`(L, ≤)` é **reticulado** se para todos `a, b ∈ L` existem `a ∨ b = sup{a,b}` e `a ∧ b = inf{a,b}`. Propriedades:
- `a ≤ a ∨ b`, `b ≤ a ∨ b`; e se `a ≤ c` e `b ≤ c`, então `a ∨ b ≤ c` (∨ é o **menor** limitante superior).
- `a ∧ b ≤ a`, `a ∧ b ≤ b`; e se `c ≤ a` e `c ≤ b`, então `c ≤ a ∧ b` (∧ é o **maior** limitante inferior).
- Comutativas, associativas, idempotentes, e absorção `a ∨ (a ∧ b) = a`.

## Exemplo resolvido
- `(P(S), ⊆)`: `∨ = ∪`, `∧ = ∩` — é reticulado.
- `(ℕ, |)` (divisibilidade): `a ∨ b = mmc(a,b)`, `a ∧ b = mdc(a,b)` — reticulado.
- `(ℕ, ≤)`: `a ∨ b = max`, `a ∧ b = min`.

## Erros comuns
- Achar que toda ordem parcial é reticulado (pode faltar sup/inf de algum par).
- Trocar `∨` (supremo) com `∧` (ínfimo).""",
        questions=(
            graded("alg-reticulados-q1", "alg-reticulados",
                   "Um **reticulado** é um poset em que todo par de elementos tem:",
                   ["apenas supremo", "supremo e ínfimo",
                    "um complemento", "apenas um minimal"], 1,
                   "Reticulado: para quaisquer a, b existem a ∨ b (sup) e a ∧ b (inf).",
                   EASY),
            graded("alg-reticulados-q2", "alg-reticulados",
                   "Em `(P(S), ⊆)`, as operações `∨` e `∧` são, respectivamente:",
                   ["∩ e ∪", "∪ e ∩", "− e ∪", "× e ∩"], 1,
                   "Supremo = união (menor conjunto que contém ambos); ínfimo = interseção.",
                   MEDIUM),
            graded("alg-reticulados-q3", "alg-reticulados",
                   "Em `(ℕ, |)` (divisibilidade), `a ∧ b` (ínfimo) é:",
                   ["mmc(a,b)", "mdc(a,b)", "a + b", "max(a,b)"], 1,
                   "O maior que divide ambos é o mdc; o supremo (∨) é o mmc.",
                   HARD),
            graded("alg-reticulados-q4", "alg-reticulados",
                   "Num reticulado, a operação `∨` é **comutativa**, ou seja:",
                   ["a ∨ b = a", "a ∨ b = b ∨ a",
                    "a ∨ b = a ∧ b", "(a ∨ b) ∨ c ≠ a ∨ (b ∨ c)"], 1,
                   "sup{a,b} = sup{b,a} — a ordem do par não importa, portanto ∨ é comutativa.",
                   EASY),
            graded("alg-reticulados-q5", "alg-reticulados",
                   "A propriedade de **idempotência** em reticulados afirma que `a ∨ a` é:",
                   ["0", "a", "1", "a ∧ a + 1"], 1,
                   "sup{a,a} = a (o menor elemento ≥ a é o próprio a). Analogamente, a ∧ a = a.",
                   MEDIUM),
            graded("alg-reticulados-q6", "alg-reticulados",
                   "O poset `({1,2,3,5,6,10,15,30}, |)` é um reticulado porque:",
                   ["tem mínimo e máximo",
                    "todo par tem mmc e mdc dentro do conjunto",
                    "é uma ordem total",
                    "tem exatamente 8 elementos"], 1,
                   "Para ser reticulado, todo par precisa de sup (mmc) e inf (mdc) no conjunto. "
                   "30 = 2·3·5, e todos os divisores de 30 formam um reticulado sob divisibilidade.",
                   HARD),
            graded("alg-reticulados-q7", "alg-reticulados",
                   "Em `({1,2,3,4,6,12}, |)`, `4 ∨ 6` é:",
                   ["2", "4", "12", "24"], 2,
                   "4 ∨ 6 = mmc(4,6) = 12. 12 está no conjunto e é o menor múltiplo comum de 4 e 6.",
                   MEDIUM),
        ),
        practice=(
            practice("alg-reticulados-p1", "alg-reticulados",
                     "Toda ordem parcial é um reticulado?",
                     ["Sim", "Não — pode faltar sup/inf de algum par",
                      "Só as finitas", "Só as totais"], 1,
                     "Reticulado exige sup e inf para TODO par; nem toda ordem parcial cumpre isso.",
                     MEDIUM),
            practice("alg-reticulados-p2", "alg-reticulados",
                     "Em `(ℕ, ≤)`, `a ∨ b` é:",
                     ["min(a,b)", "max(a,b)", "a·b", "mdc(a,b)"], 1,
                     "Numa ordem total, o supremo de {a,b} é o maior: max(a,b).",
                     EASY),
            practice("alg-reticulados-p3", "alg-reticulados",
                     "A lei de absorção num reticulado diz que `a ∨ (a ∧ b)` é:",
                     ["b", "a", "a ∧ b", "0"], 1,
                     "Absorção: a ∨ (a ∧ b) = a (e dualmente a ∧ (a ∨ b) = a).",
                     HARD),
            practice("alg-reticulados-p4", "alg-reticulados",
                     "Toda **ordem total** finita é um reticulado?",
                     ["Não", "Sim — sup = max e inf = min do par",
                      "Só se tiver mais de 2 elementos", "Só se tiver mínimo"], 1,
                     "Numa ordem total, quaisquer a, b são comparáveis: sup{a,b} = max(a,b) e inf{a,b} = min(a,b). "
                     "Logo todo par tem sup e inf — é reticulado.",
                     MEDIUM),
            practice("alg-reticulados-p5", "alg-reticulados",
                     "A operação `∧` num reticulado é **associativa**, ou seja:",
                     ["a ∧ b = b ∧ a",
                      "(a ∧ b) ∧ c = a ∧ (b ∧ c)",
                      "a ∧ (b ∨ c) = (a ∧ b) ∨ (a ∧ c)",
                      "a ∧ a = 0"], 1,
                     "Associatividade: (a ∧ b) ∧ c = a ∧ (b ∧ c). A opção 0 é comutatividade; a opção 2 é distributividade.",
                     MEDIUM),
            practice("alg-reticulados-p6", "alg-reticulados",
                     "O conjunto `{1,2,3}` com divisibilidade é um reticulado?",
                     ["Sim", "Não — mmc(2,3)=6 ∉ {1,2,3}",
                      "Só se adicionarmos 0", "Depende da orientação"], 1,
                     "mmc(2,3) = 6, que não pertence ao conjunto. Sem supremo para o par {2,3}, não é reticulado.",
                     HARD),
        ),
    ),
    concept(
        id="alg-booleana",
        title="Álgebra booleana",
        unit=3,
        topic=10,
        prerequisites=("alg-reticulados",),
        content="""## Intuição
Uma **álgebra booleana** é um reticulado especialmente bem-comportado: **distributivo**, **limitado** (tem menor elemento `0` e maior `1`) e **complementado** (todo elemento tem um oposto). É a estrutura da lógica proposicional e dos circuitos digitais.

## Definição formal
Reticulado `(L, ∨, ∧)` é **álgebra booleana** se:
- **distributivo:** `a ∧ (b ∨ c) = (a ∧ b) ∨ (a ∧ c)` e o dual;
- **limitado:** existem `0` (mínimo) e `1` (máximo);
- **complementado:** todo `a` tem `a'` com `a ∧ a' = 0` e `a ∨ a' = 1`.
Vale De Morgan: `(a ∨ b)' = a' ∧ b'` e `(a ∧ b)' = a' ∨ b'`.

## Exemplo resolvido
- `(P(S), ∪, ∩)`: `0 = ∅`, `1 = S`, complemento `a' = Sᶜ` — **álgebra booleana**.
- `({0,1}, ∨, ∧, ¬)`: a álgebra de dois elementos (OU, E, NÃO) — base dos circuitos digitais.

## Erros comuns
- Confundir reticulado qualquer com booleano (precisa ser distributivo **e** complementado, com `0` e `1`).
- Errar De Morgan na versão booleana (o complemento troca `∨` por `∧`).""",
        questions=(
            graded("alg-booleana-q1", "alg-booleana",
                   "Uma **álgebra booleana** é um reticulado que é:",
                   ["apenas limitado",
                    "distributivo, limitado e complementado",
                    "totalmente ordenado",
                    "sem elemento 0"], 1,
                   "Álgebra booleana = reticulado distributivo + limitado (0 e 1) + complementado.",
                   MEDIUM),
            graded("alg-booleana-q2", "alg-booleana",
                   "Em `(P(S), ∪, ∩)` como álgebra booleana, o complemento de `A` é:",
                   ["A", "Sᶜ aplicado a A, isto é, S − A", "∅", "A ∪ S"], 1,
                   "O complemento é S − A (o que falta para chegar ao 1 = S). E A ∩ (S−A) = ∅, A ∪ (S−A) = S.",
                   MEDIUM),
            graded("alg-booleana-q3", "alg-booleana",
                   "Numa álgebra booleana, `(a ∨ b)'` é igual a:",
                   ["a' ∨ b'", "a' ∧ b'", "a ∧ b", "1"], 1,
                   "De Morgan booleano: o complemento da junção é o encontro dos complementos.",
                   HARD),
            graded("alg-booleana-q4", "alg-booleana",
                   "Numa álgebra booleana, `a ∧ (b ∨ c)` é igual a:",
                   ["(a ∧ b) ∨ c", "(a ∧ b) ∨ (a ∧ c)",
                    "a ∨ (b ∧ c)", "a ∧ b ∧ c"], 1,
                   "Distributividade: a ∧ (b ∨ c) = (a ∧ b) ∨ (a ∧ c). Essa propriedade é exigida para ser álgebra booleana.",
                   MEDIUM),
            graded("alg-booleana-q5", "alg-booleana",
                   "Numa álgebra booleana, `a ∨ 1` é igual a:",
                   ["a", "0", "1", "a'"], 2,
                   "1 é o máximo: a ∨ 1 = sup{a,1} = 1 para todo a, pois 1 ≥ a sempre.",
                   EASY),
            graded("alg-booleana-q6", "alg-booleana",
                   "Numa álgebra booleana, `(a')'` é igual a:",
                   ["0", "1", "a", "a'"], 2,
                   "O complemento é involutivo: complementar duas vezes retorna ao elemento original. "
                   "(a')' satisfaz (a')' ∧ a' = 0 e (a')' ∨ a' = 1, que é exatamente a definição de complemento de a' — e esse é a.",
                   MEDIUM),
            graded("alg-booleana-q7", "alg-booleana",
                   "Toda álgebra booleana finita tem exatamente `2ⁿ` elementos para algum `n ∈ ℕ`. "
                   "Qual das seguintes **não** pode ser uma álgebra booleana?",
                   ["um conjunto com 2 elementos", "um conjunto com 4 elementos",
                    "um conjunto com 6 elementos", "um conjunto com 8 elementos"], 2,
                   "Álgebras booleanas finitas têm cardinalidade 2ⁿ (isomorfas a P(S) para algum S). "
                   "6 não é potência de 2, portanto não pode ser álgebra booleana.",
                   HARD),
        ),
        practice=(
            practice("alg-booleana-p1", "alg-booleana",
                     "O menor e o maior elementos de uma álgebra booleana são denotados:",
                     ["∅ e S", "0 e 1", "a e b", "∧ e ∨"], 1,
                     "0 é o mínimo e 1 o máximo (em P(S): 0 = ∅, 1 = S).",
                     EASY),
            practice("alg-booleana-p2", "alg-booleana",
                     "O complemento `a'` satisfaz:",
                     ["a ∧ a' = 1", "a ∧ a' = 0 e a ∨ a' = 1",
                      "a ∨ a' = 0", "a' = a"], 1,
                     "Por definição de complemento: a ∧ a' = 0 e a ∨ a' = 1.",
                     MEDIUM),
            practice("alg-booleana-p3", "alg-booleana",
                     "A álgebra booleana de **dois elementos** `{0,1}` modela:",
                     ["números reais", "os circuitos digitais (E, OU, NÃO)",
                      "ordens totais infinitas", "a divisibilidade"], 1,
                     "{0,1} com ∧=E, ∨=OU, '=NÃO é a base da lógica digital.",
                     EASY),
            practice("alg-booleana-p4", "alg-booleana",
                     "Numa álgebra booleana, `a ∧ 0` é igual a:",
                     ["a", "1", "0", "a'"], 2,
                     "0 é o mínimo: a ∧ 0 = inf{a,0} = 0 para todo a, pois 0 ≤ a sempre.",
                     EASY),
            practice("alg-booleana-p5", "alg-booleana",
                     "Numa álgebra booleana, `(a ∧ b)'` é igual a:",
                     ["a' ∧ b'", "a ∨ b", "a' ∨ b'", "a ∧ b'"], 2,
                     "De Morgan dual: o complemento do encontro é a junção dos complementos. (a ∧ b)' = a' ∨ b'.",
                     MEDIUM),
            practice("alg-booleana-p6", "alg-booleana",
                     "O reticulado `({1,2,3,6}, |)` é uma álgebra booleana?",
                     ["Não, pois não é distributivo",
                      "Sim — é distributivo, limitado (1 e 6) e complementado",
                      "Não, pois não tem complementos",
                      "Só se adicionarmos o 0"], 1,
                     "1 é o mínimo, 6 o máximo. Complementos: 2'=3 (mdc=1, mmc=6) e 3'=2. "
                     "É distributivo (divisores de 6 = 2·3). Logo é álgebra booleana, isomorfa a P({a,b}).",
                     HARD),
        ),
    ),
)
