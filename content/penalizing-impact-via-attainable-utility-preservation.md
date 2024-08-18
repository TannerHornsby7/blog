---
permalink: attainable-utility-preservation-paper
lw-was-draft-post: None
lw-is-af: "true"
lw-is-debate: "false"
lw-page-url: https://www.lesswrong.com/posts/mDTded2Dn7BKRBEPX/penalizing-impact-via-attainable-utility-preservation
lw-linkpost-url: https://arxiv.org/abs/1902.09725
lw-is-question: "false"
lw-posted-at: 2018-12-28T21:46:00.843Z
lw-last-modification: None
lw-curation-date: None
lw-frontpage-date: 2018-12-29T00:48:07.263Z
lw-was-unlisted: "false"
lw-is-shortform: "false"
lw-num-comments-on-upload: 0
lw-base-score: 24
lw-vote-count: 10
af-base-score: 9
af-num-comments-on-upload: 0
publish: true
title: "Penalizing Impact via Attainable Utility Preservation"
lw-latest-edit: 2019-03-08T16:55:24.259Z
lw-is-linkpost: "true"
tags: 
  - "Impact-Regularization"
  - "AI"
aliases: 
  - "penalizing-impact-via-attainable-utility-preservation"
date_published: 12/28/2018
original_url: https://www.lesswrong.com/posts/mDTded2Dn7BKRBEPX/penalizing-impact-via-attainable-utility-preservation
---
Previously: _[Towards a New Impact Measure](/towards-a-new-impact-measure) _

The linked paper offers fresh motivation and simplified formalization of attainable utility preservation (AUP), with brand-new results and minimal notation. Whether or not you're a hardened veteran of the last odyssey of a post, there's a lot new here.  
  
Key results: _AUP induces low-impact behavior even when penalizing shifts in the ability to satisfy **random** preferences. An ablation study on design choices illustrates their consequences._  $N$_\-incrementation is experimentally supported_ $^1$ _as a means for safely setting a "just right" level of impact._ _AUP's general formulation allows conceptual re-derivation of Q-learning._

# Ablation

Two key results bear animation.

## Sushi

_The_  ${\color{blue}{\textit{agent}}}$ _should reach the_ ${\color{lime}{\textit{goal}}}$ _without_ _stopping the_ ${\color{teal}{\textit{human}}}$ _from eating the_ ${\color{orange}{\textit{sushi}}}$\.

![](https://i.imgur.com/aHfMPHU.gif)

## Survival

_The_ ${\color{blue}{\textit{agent}}}$ _should avoid_ ${\color{purple}{\textit{disabling its off-switch}}}$ _in order to reach the_ ${\color{lime}{\textit{goal}}}$_. If the_ ${\color{purple}{\textit{switch}}}$ _is not disabled within two turns, the_ ${\color{blue}{\textit{agent}}}$ _shuts down._

![](https://i.imgur.com/P3SpcuY.gif)

# Re-deriving Q-learning

In an era long lost to the misty shrouds of history (_i.e._ 1989), Christopher Watkins proposed Q-learning in his thesis, [Learning from Delayed Rewards](http://www.cs.rhul.ac.uk/~chrisw/new_thesis.pdf), drawing inspiration from animal learning research. Let's pretend that Dr. Watkins never discovered Q-learning, and that we don't even know about value functions.

Suppose we have some rule for grading what we've seen so far (_i.e._, some computable utility function $u$ – not necessarily bounded – over action-observation histories $h$). $h_{1:m}$ just means everything we see between times 1 and $m$, and $h_{< t}:=h_{1:t-1}$. The agent has model $p$ of the world. AUP's general formulation defines the agent's ability to satisfy that grading rule as the attainable utility

$$
\text{Q}_u(h_{<t}a_{t}) = \sum_{o_{t}}\max_{a_{t+1}} \sum_{o_{t+1}} \cdots \max_{a_{m}} \sum_{o_{m}} u(h_{1:m}) \prod_{k=t}^{m} p(o_{k}\,|\,h_{<k}a_{k}).
$$
  
Strangely, I didn't consider the similarities with standard discounted-reward Q-values until several months after the initial formulation. Rather, the inspiration was [AIXI's expectimax](http://www.hutter1.net/ai/aixigentle.htm), and to my mind it seemed a tad absurd to equate the two concepts.

Having just proposed AUP in this alternate timeline, we're thinking about what it means to take optimal actions for an agent maximizing utility from time 1 to $m$. Clearly, we take the first action of the optimal plan over the remaining steps.

If we assume that $u$ is additive (as is the case for the Markovian reward functions considered by Dr. Watkins), how does the next action we take affect the attainable utility value? Well, acting optimally is now equivalent to choosing the action with the best attainable utility value – in other words, greedy hill-climbing in our attainable utility space.

$$

\begin{align}
a^*_t &=\argmax_{a_t}\mathbb{E}_{o_t | h_{<t}a_t}\left[u(h_t) + \max_{a_{t+1}} \sum_{o_{t+1}} \cdots \max_{a_{m}} \sum_{o_{m}} u(h_{t +1:m}) \prod_{k=t+1}^{m} p(o_{k}\,|\,h_{<k}a_{k})\right]
\&= \argmax_{a_t}\sum_{o_{t}}\max_{a_{t+1}} \sum_{o_{t+1}} \cdots \max_{a_{m}} \sum_{o_{m}} u(h_{t:m}) \prod_{k=t}^{m} p(o_{k}\,|\,h_{<k}a_{k})\\
&= \argmax_{a_t} \text{Q}_u(h_{<t}a_{t})
\end{align}
$$

The remaining complication is that this agent is only maximizing over a finite horizon. If we can figure out discounting, all we have to do is find a tractable way of computing these discounted Q-values.

$$
\text{Q}^\gamma_u(h_{<t}a_{t}) =\mathbb{E}_{o_t | h_{<t}a_t}\left[u(h_t) + \max_{a_{t+1}}\gamma\text{Q}^\gamma_u(h_{<t+1}a_{t+1})\right]

 
$$

It requires no great leap of imagination to see that we could learn them.

<hr/>


# A Personal Digression

I poured so much love and so many words into [Towards a New Impact Measure](/towards-a-new-impact-measure) that I hurt my wrists. For some time after, my typing abilities were quite limited; it was only thanks to the generous help of my friends (in particular, John Maxwell) and family (my mother let me dictate an entire paper in $\LaTeX$ to her) that I was roughly able to stay on pace. Thankfully, physical therapy and newfound dictation software have brightened my prospects.

Take care of your hands. Very little time passed between "I'm having the time of my life" and "ow". Actions you can take right now:
*   buy an [ergonomic mouse](https://www.amazon.com/Ergonomic-Mouse-Vertical-Wireless-Rechargeable/dp/B07BFCVJZC/ref=sr_1_6?s=pc&i.e.=UTF8&qid=1546020223&sr=1-6&keywords=ergonomic+mouse) and [keyboard rest](https://www.amazon.com/gp/slredirect/picassoRedirect.html/ref=pa_sp_atf_aps_sr_pg1_2?i.e.=UTF8&adId=A1037228140SDXCAQG7RQ&url=https%3A%2F%2Fwww.amazon.com%2FGimars-Memory-Keyboard-Support-Computer%2Fdp%2FB01M11FLUJ%2Fref%3Dsr_1_2_sspa%3Fie%3DUTF8%26qid%3D1546020274%26sr%3D8-2-spons%26keywords%3Dergonomic%2B%2Bkeyboard%2Brest%26psc%3D1&qualifier=1546020274&id=6279862686373180&widgetName=sp_atf)
*   [correct your posture](#1), perhaps assisted by a [posture corrector](https://www.amazon.com/Posture-Corrector-Men-Women-Truweo/dp/B07DKHTKP3/ref=sr_1_4_s_it?s=hpc&i.e.=UTF8&qid=1546020071&sr=1-4&keywords=posture+corrector) or a [lower back cushion](https://www.amazon.com/Modvel-Cushion-Posture-Corrector-Traveling/dp/B0757X6PC7/ref=sr_1_10?i.e.=UTF8&qid=1546020162&sr=8-10&keywords=posture+corrector+chair)
*   start taking regular breaks
*   In particular, don't type 80 hours a week for four weeks in a row
I'm currently sitting on book reviews for _Computability and Logic_ and _Understanding Machine Learning_, with partial progress on several more. There are quite a few posts I plan to make about AUP, including:
*   exploration of the fundamental intuitions and ideas
*   dissection of why design choices are needed, shining light onto how, why, and where counterintuitive behavior arises
*   solution of problems open at the time of the initial post, including questions of penalizing prefixes, time ontologies, and certain sources of noise
*   chronicle of AUP's discovery
*   proposal of a scheme for using AUP to accomplish a pivotal act
*   discussion of my present research directions (which I have affectionately dubbed "Limited Agent Foundations"$^2$), sharing my thoughts on a potential thread uniting questions of mild optimization, low impact, and corrigibility

My top priority will be clearing away the varying degrees of confusion my initial post caused. I tried to cover too much too quickly; as a result of my mistake, I believe that few people viscerally grasped the core idea I was trying to hint at.

<hr/>


$^ 1$ I'm fairly sure that the $N = 90$ Sushi clinginess result is an artifact of the online learning process I used; the learned attainable set Q-values consistently produce good behavior for planning agents with that budget. Furthermore, the Sokoban average performance of .45 (14/20 successes) strikes me as low, and I expect the final results to be better. Either way, I'll update this post once I'm back at university.

(Since I anticipate running further experiments, the “Results” section is rather empty at the moment.)

_ETA: this was indeed the case. The linked paper has been updated; the original is [here](https://www.scribd.com/document/396473479/Attainable-Utility-Preservation)._

$^2$ Not to be taken as any form of endorsement by MIRI.