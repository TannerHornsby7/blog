---
permalink: cheese-vector-paper-announcement
lw-was-draft-post: "false"
lw-is-af: "true"
lw-is-debate: "false"
lw-page-url: https://www.lesswrong.com/posts/DKtWikjcdApRj3rWr/paper-understanding-and-controlling-a-maze-solving-policy
lw-linkpost-url: https://arxiv.org/abs/2310.08043
lw-is-question: "false"
lw-posted-at: 2023-10-13T01:38:09.147Z
lw-last-modification: 2023-10-13T17:37:49.828Z
lw-curation-date: None
lw-frontpage-date: 2023-10-13T17:37:49.714Z
lw-was-unlisted: "false"
lw-is-shortform: "false"
lw-num-comments-on-upload: 0
lw-base-score: 69
lw-vote-count: 25
af-base-score: 37
af-num-comments-on-upload: 0
publish: true
title: "Paper: Understanding and Controlling a Maze-Solving Policy Network"
lw-latest-edit: 2023-10-13T02:22:44.726Z
lw-is-linkpost: "true"
authors: Alex Turner, Ulisse Mini, Peli Grietzer, Mrinank Sharma, Austin Meek, Monte MacDiarmid, and Lisa Thiergart
tags: 
  - "shard-theory"
  - "AI"
  - "activation-engineering"
aliases: 
  - "paper-understanding-and-controlling-a-maze-solving-policy"
lw-reward-post-warning: "false"
use-full-width-images: "false"
date_published: 10/13/2023
original_url: https://www.lesswrong.com/posts/DKtWikjcdApRj3rWr/paper-understanding-and-controlling-a-maze-solving-policy
---
Mrinank, Austin, and Alex wrote a paper on the results from [Understanding and controlling a maze-solving policy network](/understanding-and-controlling-a-maze-solving-policy-network), [Maze-solving agents: Add a top-right vector, make the agent go to the top-right](/top-right-steering-vector), and [Behavioural statistics for a maze-solving agent](/statistics-of-a-maze-solving-network).

> **Abstract:** To understand the goals and goal representations of AI systems, we carefully study a pretrained reinforcement learning policy that solves mazes by navigating to a range of target squares. We find this network pursues multiple context-dependent goals, and we further identify circuits within the network that correspond to one of these goals. In particular, we identified eleven channels that track the location of the goal. By modifying these channels, either with hand-designed interventions or by combining forward passes, we can partially control the policy. We show that this network contains redundant, distributed, and retargetable goal representations, shedding light on the nature of goal-direction in trained policy networks.

We ran a few new experiments, including a quantitative analysis of our retargetability intervention. We'll walk through those new results now. 

![](https://res.cloudinary.com/lesswrong-2-0/image/upload/f_auto,q_auto/v1/mirroredImages/DKtWikjcdApRj3rWr/jbwksgzxm1h8hzspvypz)

Retargeting the mouse to a square involves increasing the probability that the mouse goes to the target location. Therefore, to see how likely the mouse is to visit any given square, Alex created a heatmap visualization:

![](https://res.cloudinary.com/lesswrong-2-0/image/upload/f_auto,q_auto/v1/mirroredImages/DKtWikjcdApRj3rWr/qd9kbctvk3rdljml2mt6)
<br/>Figure: **Normalized path probability heatmap.** The _normalized path probability_ is the geometric average probability, under a policy, along the shortest path to a given point. It roughly measures how likely a policy is to visit that part of the maze.  
  
The color of each maze square shows the normalized path probability for the path from the starting position in the maze to the square. In this image, we show the "base probabilities" under the unmodified policy.

For each maze square, we can try different retargeting interventions, and then plot the new normalized path probability towards that square:

![](https://res.cloudinary.com/lesswrong-2-0/image/upload/f_auto,q_auto/v1/mirroredImages/DKtWikjcdApRj3rWr/vu1sqt3tg7fczncelr2r)

Notice the path from the bottom-left (where the mouse always starts) to the top-right corner. This is the _top-right path_. Looking at these heatmaps, it's harder to get the mouse to go farther from the top-right path. Quantitative analysis bears out this intuition:

![](https://res.cloudinary.com/lesswrong-2-0/image/upload/f_auto,q_auto/v1/mirroredImages/DKtWikjcdApRj3rWr/hxt1sr3sbkmj5m9a22l6)![](https://res.cloudinary.com/lesswrong-2-0/image/upload/f_auto,q_auto/v1/mirroredImages/DKtWikjcdApRj3rWr/o7jxdzslsiwmqchamffu)![](https://res.cloudinary.com/lesswrong-2-0/image/upload/f_auto,q_auto/v1/mirroredImages/DKtWikjcdApRj3rWr/quxikddjem0pmtuiutxx)

Overall, these new results quantify how well we can control the policy via the internal goal representations which we identified.

> [!thanks]
>Thanks to Lisa Thiergart for helping handle funding and set up the project. Thanks to the LTFF and Lightspeed grants for funding this project.