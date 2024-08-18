---
permalink: definitive-confirmation-of-shard-theory
lw-was-draft-post: None
lw-is-af: "false"
lw-is-debate: "false"
lw-page-url: https://www.lesswrong.com/posts/wvbGiHwbie24mmhXw/april-fools-definitive-confirmation-of-shard-theory
lw-linkpost-url: https://www.lesswrong.com/posts/wvbGiHwbie24mmhXw/april-fools-definitive-confirmation-of-shard-theory
lw-is-question: "false"
lw-posted-at: 2023-04-01T07:27:23.096Z
lw-last-modification: 2023-04-03T16:23:50.515Z
lw-curation-date: None
lw-frontpage-date: 2023-04-01T19:34:16.770Z
lw-was-unlisted: "false"
lw-is-shortform: "false"
lw-num-comments-on-upload: 7
lw-base-score: 166
lw-vote-count: 105
af-base-score: 57
af-num-comments-on-upload: 0
publish: true
title: "[April Fools'] Definitive confirmation of shard theory"
lw-latest-edit: 2023-04-03T16:23:51.143Z
lw-is-linkpost: "false"
tags: 
  - "Shard-Theory"
  - "Humor"
  - "AI"
  - "Postmortems-&-Retrospectives"
aliases: 
  - "april-fools-definitive-confirmation-of-shard-theory"
date_published: 04/01/2023
original_url: https://www.lesswrong.com/posts/wvbGiHwbie24mmhXw/april-fools-definitive-confirmation-of-shard-theory
---
I've written [a lot about shard theory](https://www.lesswrong.com/sequences/nyEFg3AuJpdAozmoX) over the last year. I've poured dozens of hours into theorycrafting, communication, and LessWrong comment threads. I pored over theoretical alignment concerns with exquisite care and worry. I even read a few things that weren't blog posts on LessWrong.[^1] In other words, I went _all out._

Last month, I was downloading [`gpt-neox-20b`](https://arxiv.org/abs/2204.06745) when I noticed the following:

![](https://res.cloudinary.com/lesswrong-2-0/image/upload/f_auto,q_auto/v1/mirroredImages/wvbGiHwbie24mmhXw/tfn0r9gzsanfpygvry4w)
<br/>Figure: **Not only does** `**gpt-neox-20b**` **have shards, it has has exactly forty-six.**

I've concluded the following:
*   Shard theory is correct (at least, for `gpt-neox-20b`).
*   I wasted a lot of time arguing on LessWrong when I could have just [touched grass](https://www.lesswrong.com/posts/fqryrxnvpSr5w2dDJ/touch-reality-as-soon-as-possible-when-doing-machine) and ran the cheap experiment of actually _downloading a model_ and observing what happens. 
*   I totally underappreciated how much work the broader AI community[^2] has done on alignment. They are literally able to print out how many shards an "uninterpretable" model like `gpt-neox-20b` has.
    *   They don't whine about how tough these models are to interpret. They just got the damn job done.
    *   This really makes team shard's [recent work](/understanding-and-controlling-a-maze-solving-policy-network) look naive and incomplete. I think we found subcircuits of _a_ cheese-shard. The ML community just found _all 46_ shards in `gpt-neox-20b`, and nonchalantly printed that number for us to read.
*   This is embarrassing for me, even though shard theory just got confirmed. I _seriously_ spent months arguing about this stuff? Cringe. 
    *   I did a bad job of interpreting theoretical arguments, given that I was still uncertain after months of thought. Probably this is hard and we are bad at it.
    *   Stop arguing in huge comment threads about what highly speculative approaches are going to work, and start making your beliefs pay rent by finding ways to experimentally test them. 
    *   See [how well you can predict AI alignment results _today_](/predictions-for-shard-theory-mechanistic-interpretability) before trying to predict what happens for 500IQ GPT-5.
    *   I don't ever want to hear another "but I won't be able to learn until the intelligence explosion happens or not." Correct theories [leave many clues and hints](https://www.lesswrong.com/posts/XTWkjCJScy2GFAgDt/dark-side-epistemology), and some of those are going to be findable today. If even a navel-gazing edifice like shard theory can get instantly experimentally confirmed, so can your theory.

I then had GPT-4 identify some of the 46 shards. 

1.  **The Procrastination Shard:** This shard makes the AI model continually suggest that users read just one more LessWrong post or engage in another lengthy comment thread before taking any real-world action.
2.  **Hindsight Bias Shard:** This shard leads the model to believe it knew the answer all along after learning new information, making it appear much smarter in retrospect.
3.  **The "Armchair Philosopher" Shard:** With this shard, the AI can generate lengthy and convoluted philosophical arguments on any topic, often without any direct experience or understanding of the subject matter.
4.  **Argumentative Shard:** A shard that compels the model to challenge every statement and belief, regardless of how trivial or uncontroversial it may be.
5.  **Trolley Problem Shard:** This shard makes the model obsess over hypothetical moral dilemmas and ethical conundrums, while ignoring more practical and immediate concerns.
6.  **The Existential Dread Shard:** This shard causes the AI to frequently bring up the potential risks of AI alignment and existential catastrophes, even when discussing unrelated topics.

I'm pleasantly surprised that `gpt-neox-20b` shares values which I (and other LessWrong users) have historically demonstrated. The fact that `gpt-neox-20b` and LessWrong share many shards makes me more optimistic about alignment overall, since it implies convergence in the values of real-world trained systems.

(As a corollary, this demonstrates that LLMs can make serious alignment progress.)

<hr/>


Although I'm embarrassed and humbled by this experience, I'm glad that shard theory is true. Here's to—next time—only taking three months before running the first experiment! 🥂

[^1]: DM me if you want links to websites where you can find information which is not available on LessWrong!
    
[^2]: "The broader AI community" taken in particular to include more traditional academics, like those at [EleutherAI](https://discord.gg/zBGx3azzUn).