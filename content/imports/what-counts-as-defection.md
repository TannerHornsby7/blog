---
permalink: game-theoretic-definition-of-deception
lw-was-draft-post: None
lw-is-af: "true"
lw-is-debate: "false"
lw-page-url: https://www.lesswrong.com/posts/8LEPDY36jBYpijrSw/what-counts-as-defection
lw-linkpost-url: https://www.lesswrong.com/posts/8LEPDY36jBYpijrSw/what-counts-as-defection
lw-is-question: "false"
lw-posted-at: 2020-07-12T22:03:39.261Z
lw-last-modification: 2021-12-17T20:10:50.747Z
lw-curation-date: None
lw-frontpage-date: 2020-07-12T23:00:43.230Z
lw-was-unlisted: "false"
lw-is-shortform: "false"
lw-num-comments-on-upload: 21
lw-base-score: 81
lw-vote-count: 23
af-base-score: 34
af-num-comments-on-upload: 9
publish: true
title: "What counts as defection?"
lw-latest-edit: 2021-03-18T22:20:23.594Z
lw-is-linkpost: "false"
tags: 
  - "Game-Theory"
  - "AI"
  - "Rationality"
aliases: 
  - "what-counts-as-defection"
date_published: 07/12/2020
original_url: https://www.lesswrong.com/posts/8LEPDY36jBYpijrSw/what-counts-as-defection
---
_Thanks to Michael Dennis for proposing the formal definition; to Andrew Critch for pointing me in this direction; to Abram Demski for proposing non-negative weighting; and to Alex Appel, Scott Emmons, Evan Hubinger, philh, Rohin Shah, and Carroll Wainwright for their feedback and ideas._

_There's a good chance I'd like to publish this at some point as part of a larger work. However, I wanted to make the work available now, in case that doesn't happen soon._ 

> [!quote]
>
> They can't prove the conspiracy... But they could, if Steve runs his mouth. 
> 
> The police chief stares at you.
> 
> You stare at the table. You'd agreed (sworn!) to stay quiet. You'd even studied game theory together. But, you hadn't understood what an extra _year_ of jail meant. 
> 
> The police chief stares at you.
> 
> Let Steve be the gullible idealist. You have a family waiting for you.
>
> Sunlight stretches across the valley, dappling the grass and warming your bow. Your hand anxiously runs along the bowstring. A distant figure darts between trees, and your stomach rumbles. The day is near spent. 
> 
> The stags run strong and free in this land. Carla should meet you there. Shouldn't she? Who wants to live like a beggar, subsisting on scraps of lean rabbit meat? 
> 
> In your mind's eye, you reach the stags, alone. You find one, and your arrow pierces its barrow. The beast shoots away; the rest of the herd follows. You slump against the tree, exhausted, and never open your eyes again.
> 
> You can't risk it.

People talk about 'defection' in [social dilemma](https://www.tandfonline.com/doi/abs/10.1080/002075900399402) games, from the [prisoner's dilemma](https://en.wikipedia.org/wiki/Prisoner's_dilemma) to [stag hunt](https://en.wikipedia.org/wiki/Stag_hunt) to [chicken](https://en.wikipedia.org/wiki/Chicken_\(game\)). In the [tragedy of the commons](https://en.wikipedia.org/wiki/Tragedy_of_the_commons), we talk about defection. The concept has become a regular part of LessWrong discourse. 

**Informal definition.** A player _defects_ when they increase their personal payoff at the expense of the group.

This informal definition is no secret, being echoed from the ancient [_Formal Models of Dilemmas in Social Decision-Making_](https://apps.dtic.mil/sti/pdfs/ADA006188.pdf) to the recent [_Classifying games like the Prisoner's Dilemma_](https://www.lesswrong.com/posts/KwbJFexa4MEdhJbs4/classifying-games-like-the-prisoner-s-dilemma): 

> you can model the "defect" action as "take some value for yourself, but destroy value in the process". 

Given that the prisoner's dilemma is the bread and butter of game theory and of many parts of economics, evolutionary biology, and psychology, you might think that someone had already formalized this. However, to my knowledge, no one has.

# Formalism

Consider a finite $n$ \-player normal-form game, with player $i$ having pure action set $\mathcal{A}_i$ and payoff function $P_i: \mathcal{A}_1\times\ldots\times \mathcal{A}_n \to \mathbb{R}$. Each player $i$ chooses a _strategy_ $s_i\in\Delta(\mathcal{A}_i)$ (a distribution over $\mathcal{A}_i$). Together, the strategies form a _strategy profile_ $\mathbf{s}:= (s_1,\ldots, s_n)$. $\mathbf{s}_{-i}:=(s_1,\ldots,s_{i-1},s_{i+1},\ldots,s_n)$ is the strategy profile, excluding player $i$'s strategy. A _payoff profile_ contains the payoffs for all players under a given strategy profile.

A _utility weighting_ $(\alpha_j) _{j=1,\ldots,n}$ is a set of $n$ non-negative weights (as in [Harsanyi's utilitarian theorem](https://cadmus.eui.eu/bitstream/handle/1814/371/1991_EUI%20WP_ECO_032.pdf?sequence=1)). You can consider the weights as quantifying each player's contribution; they might represent a percieved social agreement or be the explicit result of a bargaining process. 

When all $\alpha_j$ are equal, we'll call that an _equal weighting_. However, if there are "utility monsters", we can downweight them accordingly. 

We're implicitly assuming that payoffs are comparable across players. We want to investigate: _given_ a utility weighting, which actions are defections? 

**Definition.** Player $i$'s action $a\in \mathcal{A}_i$ is a _defection_ against strategy profile $\mathbf{s}$ and weighting $(\alpha_j) _{j=1,\ldots,n}$  if 

1.  $\text{Personal gain: }P_i(a, \mathbf{s}_{-i})>P_i(s_i,\mathbf{s}_{-i})$
2.  Social loss: $\sum_{j} \alpha_jP_j(a, \mathbf{s}_{-i})<\sum_{j} \alpha_jP_j(s_i,\mathbf{s}_{-i})$

If such an action exists for some player $i$, strategy profile $\mathbf{s}$, and weighting, then we say that _there is an opportunity for defection_ in the game.

_Remark._ For an equal weighting, condition (2) is equivalent to demanding that the action not be a [Kaldor-Hicks improvement](https://en.wikipedia.org/wiki/Kaldor%E2%80%93Hicks_efficiency). 

![](https://39669.cdn.cke-cs.com/rQvD3VnunXZu34m86e5f/images/b5ad8b01496403d6cf20a734eb01d34bd9136de7cd837b62.png)
<br/>Figure: Payoff profiles in the Prisoner's Dilemma. Red arrows represent defections against pure strategy profiles; player 1 defects vertically, while player 2 defects horizontally. For example, player 2 defects with $(C_1,C_2)\to(C_1,D_2)$ because they gain ($4>3$) but the weighted sum loses out ($4<6$).

Our definition seems to make reasonable intuitive sense. In the tragedy of the commons, each player rationally increases their utility, while imposing negative externalities on the other players and decreasing total utility. A spy might leak classified information, benefiting themselves and Russia but defecting against America. 

**Definition.** _Cooperation_ takes place when a strategy profile is maintained despite the opportunity for defection.

**Theorem 1.** In constant-sum games, there is no opportunity for defection against equal weightings.

**Theorem 2.** In common-payoff games (where all players share the same payoff function), there is no opportunity for defection.

_Edit:_ In private communication, Joel Leibo points out that these two theorems formalize the intuition between the proverb "all's fair in love and war": you can't defect in fully competitive or fully cooperative situations.

**Proposition 3.** There is no opportunity for defection against Nash equilibria.

An action $a\in\mathcal{A}_i$ is a _Pareto improvement_ over strategy profile $\mathbf{s}$ if, for all players $j$,$P_j(a,\mathbf{s}_{-i})\geq P_j(s_i,\mathbf{s}_{-i})$.

**Proposition 4.** Pareto improvements are never defections. 

## Game Theorems

We can prove that formal defection exists in the trifecta of famous games. Feel free to skip proofs if you aren't interested.

![](https://39669.cdn.cke-cs.com/rQvD3VnunXZu34m86e5f/images/7c2aa97336741f1a062968218a8391d8871554d59d53c8ee.png)
<br/>Figure: In (a), variables stand for $T$emptation, $R$eward, $P$unishment, and $S$ucker. A $2×2$ symmetric game is a _Prisoner's Dilemma_ when $T>R>P>S$. Unsurprisingly, formal defection is everywhere in this game.

**Theorem 5.** In $2×2$ symmetric games, if the Prisoner's Dilemma inequality is satisfied, defection can exist against equal weightings.

_Proof._ Suppose the Prisoner's Dilemma inequality holds. Further suppose that $R>\frac{1}{2} (T+S)$. Then $2R>T+S$. Then since $T>R$ but $T+S<2R$, both players defect from $(C_1,C_2)$ with $D_i$.

Suppose instead that $R\leq \frac{1}{2}(T+S)$. Then $T+S\geq 2R>2P$, so $T+S>2P$. But $P>S$, so player 1 defects from $(C_1,D_2)$ with action $D_1$, and player 2 defects from $(D_1, C_2)$ with action $D_2$. QED.

<hr/>


![](https://39669.cdn.cke-cs.com/rQvD3VnunXZu34m86e5f/images/0de841661949492409f34e304c124aa51fdf5af64f9514fc.png)
<br/>Figure: A $2×2$ symmetric game is a _Stag Hunt_ when $R>T\geq P>S$. In Stag Hunts, due to uncertainty about whether the other player will hunt stag, players defect and fail to coordinate on the unique Pareto optimum $(\text{Stag}_1,\text{ Stag}_2)$. In (b), player 2 will defect (play $\text{Hare}_2$) when $\mathbb{P}(\text{Stag}_1)<\frac{1}{2}$. In Stag Hunts, formal defection can always occur against mixed strategy profiles, which lines up with defection in this game being due to uncertainty.

**Theorem 6.** In $2×2$ symmetric games, if the Stag Hunt inequality is satisfied, defection can exist against equal weightings.

_Proof._ Suppose that the Stag Hunt inequality is satisfied. Let $p$ be the probability that player 1 plays $\text{Stag}_1$. We now show that player 2 can always defect against strategy profile $(p, \text{Stag}_2)$ for some value of $p$.

For defection's first condition, we determine when $P_2(p,\text{Stag}_2)<P_2(p,\text{Hare}_2)$:

$$
\begin{align}   pR + (1-p) S &< pT + (1-p) P\   p&<\dfrac{P-S}{(R-T)+(P-S)}.\end{align}
$$

This denominator is positive ($R>T$ and $P>S$), as is the numerator. The fraction clearly falls in the open interval $(0,1)$.

For defection's second condition, we determine when

$$
\begin{align}   P_1(p,\text{Stag}_2) + P_2(p,\text{Stag}_2)&>P_1(p,\text{Hare}_2)+P_2(p,\text{Hare}_2)\   2pR + (1-p)(T+S) &> p(S+T) + (1-p) 2P\   p&> \dfrac{1}{2}  \dfrac{(P-S)+(P-T)}{(R-T)+(P-S)}.\end{align}
$$

Combining the two conditions, we have

$$
\begin{align}   1>\dfrac{P-S}{(R-T)+(P-S)}>p>\dfrac{1}{2} \dfrac{(P-S)+(P-T)}{(R-T)+(P-S)}.\end{align}
$$

Since $P-T\leq0$, this holds for some nonempty subinterval of $[0,1)$. QED.

<hr/>


![](https://39669.cdn.cke-cs.com/rQvD3VnunXZu34m86e5f/images/9a5af9e1b5fd6a2b840a77e1cdcd7d3be6941064a178be8b.png)
<br/>Figure: A $2×2$ symmetric game is _Chicken_ when $T>R\geq S>P$. In (b), defection only occurs when $\frac{10}{11}<\mathbb{P}(\text{Turn}_1)<\frac{21}{22}$: when player 1 is very likely to turn, player 2 is willing to trade a bit of total payoff for personal payoff.

**Theorem 7.** In $2×2$ symmetric games, if the Chicken inequality is satisfied, defection can exist against equal weightings.

_Proof._ Assume that the Chicken inequality is satisfied. This proof proceeds similarly as in theorem 6. Let $p$ be the probability that player 1's strategy places on $\text{Turn}_1$.

For defection's first condition, we determine when $P_2(p,\text{Turn}_2)<P_2(p,\text{Ahead}_2)$:

$$
\begin{align}    pR + (1-p) S &< pT + (1-p) P\    p&>\dfrac{P-S}{(R-T)+(P-S)}\    1\geq p&>\dfrac{S-P}{(T-R)+(S-P)}>0. \end{align}
$$

The inequality flips in the first equation because of the division by $(R-T)+(P-S)$, which is negative ($T>R$ and $S>P$). $S>P$, so $p>0$; this reflects the fact that $(\text{Ahead}_1, \text{Turn}_2)$ is a Nash equilibrium, against which defection is impossible (proposition 3).

For defection's second condition, we determine when

$$
\begin{align}    P_1(p,\text{Turn}_2) + P_2(p,\text{Turn}_2)&>P_1(p,\text{Ahead}_2)+P_2(p,\text{Ahead}_2)\    2pR + (1-p)(T+S) &> p(S+T) + (1-p) 2P\    p&<    \dfrac{1}{2}\dfrac{(P-S)+(P-T)}{(R-T)+(P-S)}\    p&<    \dfrac{1}{2}\dfrac{(S-P)+(T-P)}{(T-R)+(S-P)}. \end{align}
$$

The inequality again flips because $(R-T)+(P-S)$ is negative. When $R\leq    \frac{1}{2}(T+S)$, we have $p<1$, in which case defection does not exist against a pure strategy profile.

Combining the two conditions, we have

$$
\dfrac{1}{2}\dfrac{(S-P)+(T-P)}{(T-R)+(S-P)}>p>\dfrac{S-P}{(T-R)+(S-P)}>0.
$$

Because $T>S$,

$$
\dfrac{1}{2} \dfrac{(S-P)+(T-P)}{(T-R)+(S-P)}>\dfrac{S-P}{(T-R)+(S-P)}.
$$

QED.

# Discussion

This bit of basic theory will hopefully allow for things like principled classification of policies: "has an agent learned a 'non-cooperative' policy in a multi-agent setting?". For example, the empirical game-theoretic analyses (EGTA) of Leibo et al.'s [_Multi-agent Reinforcement Learning in Sequential Social Dilemmas_](https://arxiv.org/pdf/1702.03037.pdf) say that apple-harvesting agents are defecting when they zap each other with beams. Instead of using a qualitative metric, you could choose a desired non-zapping strategy profile, and then use EGTA to classify formal defections from that. This approach would still have a free parameter, but it seems better.

I had vague pre-theoretic intuitions about 'defection', and now I feel more capable of reasoning about what is and isn't a defection. In particular, I'd been confused by the difference between [power-seeking](/seeking-power-is-often-convergently-instrumental-in-mdps) and defection, and now I'm not.