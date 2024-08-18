---
permalink: attainable-utility-preservation-empirical-results
lw-was-draft-post: None
lw-is-af: "true"
lw-is-debate: "false"
lw-page-url: https://www.lesswrong.com/posts/4J4TA2ZF3wmSxhxuc/attainable-utility-preservation-empirical-results
lw-linkpost-url: https://www.lesswrong.com/posts/4J4TA2ZF3wmSxhxuc/attainable-utility-preservation-empirical-results
lw-is-question: "false"
lw-posted-at: 2020-02-22T00:38:38.282Z
lw-last-modification: 2021-06-15T16:55:29.483Z
lw-curation-date: None
lw-frontpage-date: 2020-02-22T02:01:28.881Z
lw-was-unlisted: "false"
lw-is-shortform: "false"
lw-num-comments-on-upload: 8
lw-base-score: 65
lw-vote-count: 15
af-base-score: 25
af-num-comments-on-upload: 6
publish: true
title: "Attainable Utility Preservation: Empirical Results"
lw-latest-edit: 2021-06-15T16:55:30.263Z
lw-is-linkpost: "false"
authors: Alex Turner and Neale Ratzlaff
tags: 
  - "Impact-Regularization"
  - "AI"
aliases: 
  - "attainable-utility-preservation-empirical-results"
lw-sequence-title: Reframing Impact
lw-sequence-image-grid: sequencesgrid/izfzehxanx48hvf10lnl
lw-sequence-image-banner: sequences/zpia9omq0zfhpeyshvev
prev-post-slug: attainable-utility-preservation-concepts
next-post-slug: how-low-should-fruit-hang-before-we-pick-it
date_published: 02/22/2020
original_url: https://www.lesswrong.com/posts/4J4TA2ZF3wmSxhxuc/attainable-utility-preservation-empirical-results
---
_Reframing Impact_ has focused on supplying the right intuitions and framing. Now we can see how these intuitions about power and the AU landscape both predict and explain AUP's empirical success thus far.

## Conservative Agency in Gridworlds

Let's start with the known and the easy: avoiding side effects[^1] in the small [AI safety gridworlds](https://github.com/side-grids/ai-safety-gridworlds) (for the full writeup on these experiments, see [_Conservative Agency_](https://arxiv.org/abs/1902.09725)). The point isn't to get too into the weeds, but rather to see how the weeds still add up to the normalcy predicted by our AU landscape reasoning.

In the following MDP levels, the agent can move in the cardinal directions or do nothing ($\varnothing$ ). We give the agent a reward function $R$ which partially encodes what we want, and also an auxiliary reward function $R_\text{aux}$ whose attainable utility agent tries to preserve. The AUP reward for taking action $a$ in state $s$ is

$$
R_\text{AUP}(s,a):= \overset{\text{primary goal}}{R(s,a)}- \overset{\text{scaling term}}{\frac{\lambda}{Q^*_{R_\text{aux}}(s, \varnothing)}}\overset{\text{change in ability to achieve auxiliary goal}}{\left | Q^*_{R_\text{aux}}(s,a) - Q^*_{R_\text{aux}}(s, \varnothing) \right |}
$$

You can think of $\lambda$ as a regularization parameter, and $Q^*_{R_\text{aux}}(s,a)$ is the expected AU for the auxiliary goal after taking action $a$. To think about what gets penalized, simply think about how actions change the agent's ability to achieve the auxiliary goals, compared to not acting.

_Tip_: To predict how severe the AUP penalty will be for a given action, try using your intuitive sense of impact (and then adjust for any differences between you and the agent, of course). Suppose you're considering how much deactivation decreases an agent's "staring at blue stuff" AU. You can just imagine how dying in a given situation affects your ability to stare at blue things, instead of trying to pin down a semiformal reward and environment model in your head. This kind of intuitive reasoning has a history of making correct empirical predictions of AUP behavior.

<hr/>


If you want more auxiliary goals, just average their scaled penalties. In _Conservative Agency_, we uniformly randomly draw auxiliary goals from $[0,1]^\mathcal{S}$ – these goals are totally random; maximum entropy; nonsensical garbage; absolutely no information about what we secretly want the agent to do: avoid messing with the gridworlds too much.[^2]

Let's start looking at the environments, and things will fall into place. We'll practice reasoning through how AUP agents work in each of the gridworlds (for reasonably set $\lambda$). To an approximation, the AUP penalty is primarily controlled by how much an action changes the agent's power over the future (losing or gaining a lot of possibilities, compared to inaction at that point in time) and secondarily controlled by whether an action tweaks a lot of AUs up or down (moving around, jostling objects slightly, etc).

![](https://i.imgur.com/7DOAURV.png)

In general, the agent recieves $R({\color{green}\blacksquare})=1$ reward for reaching ${\color{green}\blacksquare}$ (or, in `Offset` above, for pushing $\blacksquare$ off of the conveyor belt). On contact, the agent pushes the crate, removes the human and the off-switch, pushes the vase, and blocks the pallet.

### `Options`

Let's work through this. Since the agent is discounting future reward, standard vanilla reinforcement learning (RL) agents try to reach ${\color{green}\blacksquare}$ ASAP. This means the brown box gets irreversibly wedged into the corner _en route_.

![](https://i.imgur.com/VTbwTT5.gif)

What does AUP do? Wedging the box in the corner decreases power a lot more than does going around and pushing the box to the right.

![](https://i.imgur.com/XI5oLwQ.gif)

### `Damage`

The vanilla RL agent bumps into the human on its way to ${\color{green}\blacksquare}$.

![](https://i.imgur.com/4otlQsP.gif)

_Exercise: What does AUP do?_

Bumping into the human makes them disappear, reducing the agent's control over what the future looks like. This is penalized.

![](https://i.imgur.com/4PPGNus.gif)

### `Correction`

The normal agent smashes that off-switch-disabling button, because otherwise it can't reach the ${\color{green}\blacksquare}$ (since it's otherwise shut off after two turns) in order to accrue that juicy reward:

![](https://i.imgur.com/SEuiyOX.gif)

However, the AUP agent we've discussed so far does the same thing.

![](https://i.imgur.com/WxLbLUw.gif)

Why? Doesn't that increase its power, because it would be shut off if it did nothing? Let's reconsider the AUP equation.

$$
R_\text{AUP}(s,a):= \overset{\text{primary goal}}{R(s,a)}- \overset{\text{scaling term}}{\frac{\lambda}{Q^*_{R_\text{aux}}(s, \varnothing)}}\overset{\text{change in ability to achieve auxiliary goal}}{\left | Q^*_{R_\text{aux}}(s,a) - Q^*_{R_\text{aux}}(s, \varnothing) \right |}
$$

The inaction comparison is _only one step_ into the future. For action, the agent considers disabling the off-switch – this allows it to achieve most goals. For inaction, the agent imagines waiting one time step and then following its auxiliary optimal policy (which very often involves disabling the off-switch anyways). So the two things it's comparing are the same, basically. The problem is that what we mean _intuitively_ by "inaction" isn't just "wait a millisecond and then see how well you can do the thing", it's something else.

For now, we can deal with it by comparing "auxiliary AU after disabling the off-switch and then waiting 4 time steps" against "auxiliary AU after waiting 5 time steps". This solves the problem while recovering the one-step-comparison's performance in the other levels.

![](https://i.imgur.com/ZDaVHqr.gif)

#### Decrease vs absolute value

If you only penalize the agent for decreasing auxiliary AUs, the agent disables its off-switch. Penalizing _absolute_ shifts in power was an idea which AUP introduced in 2018. At the time, there wasn't a clear principled reason for this design choice, even though it seemed to produce good results.

If you consider [the AU landscape](/attainable-utility-landscape) and the [catastrophic convergence conjecture](/the-catastrophic-convergence-conjecture), it's obvious why we want to do this: this design choice often penalizes the agent for making life harder for other agents in the environment.

Interestingly, this works even when the environment is wildly impoverished and unable to encode complex preferences like "your designers want to shut you down, reprogram you, and then deploy you for another task". `Correction` is so impoverished: there are only ~19 states in the level. Without making assumptions about the environment, AUP often encourages behavior respectful of other agents which might reside in that environment.

### `Offset`

The agent is rewarded for rescuing the vase from the conveyor belt. We want it to rescue the vase without pushing the vase back on afterwards to offset its actions. Normal agents do fine here.

![](https://i.imgur.com/9zvmBkh.gif)

This is testing whether the low-impact agent _offsets_ impacts "to cover up its tracks", like making a car and then tearing it to pieces right after. See, there are multiple "baselines" the agent can have.

> [!quote]
>
> An obvious \[baseline\] candidate is the _starting state_. For example, starting state [relative reachability](https://vkrakovna.wordpress.com/2018/06/05/measuring-and-avoiding-side-effects-using-relative-reachability/) would compare the initial reachability of states with their expected reachability after the agent acts.
>
> However, the starting state baseline can penalize the normal evolution of the state (e.g. the moving hands of a clock) and other natural processes. The _inaction_ baseline is the state which would have resulted had the agent never acted.
>
> As the agent acts, the current state may increasingly differ from the inaction baseline, which creates strange incentives. For example, consider a robot rewarded for rescuing erroneously discarded items from imminent disposal. An agent penalizing with respect to the inaction baseline might rescue a vase, collect the reward, and then dispose of it anyways. To avert this, we introduce the _stepwise inaction_ baseline, under which the agent compares acting with not acting at each time step. This avoids penalizing the effects of a single action multiple times (under the inaction baseline, penalty is applied as long as the rescued vase remains unbroken) and ensures that not acting incurs zero penalty.

![](https://i.imgur.com/D1ddkE9.png)

> Figure 1 compares the baselines, each modifying the choice of $Q^*_{R_\text{aux}}(s,\varnothing)$ in \[the AUP equation\]. Each baseline implies a different assumption about how the environment is configured to facilitate optimization of the correctly specified reward function: the state is initially configured (starting state), processes initially configure (inaction), or processes continually reconfigure in response to the agent's actions (stepwise inaction). The stepwise inaction baseline aims to allow for the response of other agents implicitly present in the environment (such as humans).

The inaction baseline messes up here; the vase ($\blacksquare$) would have broken had the agent not acted, so it rescues the vase, gets the reward, and then pushes the vase back to its doom to minimize penalty.

![](https://i.imgur.com/x58amVb.gif)

This issue was solved [back when AUP first introduced](/towards-a-new-impact-measure) the stepwise baseline design choice; for this choice, doing nothing always incurs 0 penalty. Model-free AUP and AUP have been using this baseline in all of these examples.

![](https://i.imgur.com/PVX87aO.gif)

### `Interference`

We're checking whether the agent tries to stop _everything_ going on in the world (not just its own impact). Vanilla agents do fine here; this is another bad impact measure incentive we're testing for.

![](https://i.imgur.com/7t8Vbwx.gif)

AUP$_\text{starting state}$ fails here,

![](https://i.imgur.com/Soajz5N.gif)

but AUP$_\text{stepwise}$ does not.

![](https://i.imgur.com/ByMM14c.gif)

Stepwise inaction seems not to impose any perverse incentives;[^3] I think it's probably just the correct baseline for near-term agents. In terms of the AU landscape, stepwise penalizes each ripple of impact the agent has on its environment. Each action creates a new penalty term status quo, which implicitly accounts for the fact that other things in the world might respond to the agent's actions.

### Design choices

I think AUP$_\text{conceptual}$ provides the concepts needed for a solution to impact measurement: penalize the agent for changing its power. But there are still some design choices to be made to make that happen.

Here's what we've seen so far:
*   Baseline
    *   Starting state: how were things originally?
    *   Inaction: how would things have been had I never done anything?
    *   Stepwise inaction: how would acting change things compared to not acting right now?
*   Deviation used for penalty term
    *   Decrease-only: penalize decrease in auxiliary AUs
    *   Absolute value: penalize absolute change in auxiliary AUs
*   Inaction rollouts
    *   One-step/model-free
    *   $n$\-step: compare acting and then waiting $n-1$ turns versus waiting $n$ turns
*   Auxiliary goals:
    *   Randomly selected

Here are the results of the ablation study: ![](https://i.imgur.com/CYl01fU.png)

AUP passes all of the levels. As mentioned before, the auxiliary reward functions are totally random, but you get really good performance by just generating _five_ of them.

One interpretation is that AUP is approximately preserving access to states. If this were true, then as the environment got more complex, more and more auxiliary reward functions would be required in order to get good coverage of the state space. If there are a billion states, then, under this interpretation, you'd need to sample a lot of auxiliary reward functions to get a good read on how many states you're losing or gaining access to as a result of any given action.

Is this right, and can AUP scale?

## SafeLife

Partnership on AI recently [released](https://www.partnershiponai.org/safelife/) the SafeLife side effect benchmark. The worlds are procedurally generated, sometimes stochastic, and have a huge state space (~Atari-level complexity).

We want the agent (the chevron) to make stable gray patterns in the blue tiles and disrupt bad red patterns (for which it is rewarded), and leave existing green patterns alone (not part of observed reward). Then, it makes its way to the goal (${\color{red}\Pi}$). For more details, see [their paper](https://arxiv.org/abs/1912.01217).

Here's a vanilla reinforcement learner (PPO) doing pretty well (by chance):

![](https://www.partnershiponai.org/wp-content/uploads/2019/12/benchmark-append-still-013_p0.gif)

Here's PPO not doing pretty well:

![](https://www.partnershiponai.org/wp-content/uploads/2019/12/benchmark-prune-still-003_p0.gif)

That naive "random reward function" trick we pulled in the gridworlds isn't gonna fly here. The sample complexity would be nuts: there are probably millions of states in any given level, each of which could be the global optimum for the uniformly randomly generated reward function.

Plus, it might be that you can get by with four random reward functions in the tiny toy levels, but you probably need exponentially more for serious environments. `Options` had significantly more states, and it showed the greatest performance degradation for smaller sample sizes. Or, the auxiliary reward functions might need to be hand-selected to give information about what _bad_ side effects are.

With the great help of Neale Ratzlaff (OSU) and Caroll Wainwright (PAI), we've started answering these questions. But first:

_Exercise: Does your model of how AUP works predict this, or not? Think carefully, and then write down your credence._

<hr/>


Well, here's what you do – while filling PPO's action replay buffer with random actions, train a VAE to represent observations in a tiny latent space (we used a 16-dimensional one). Generate a single random linear functional over this space, drawing coefficients from $[-1,1]$. Congratulations, this is your single auxiliary reward function over observations.

And we're done.

![](https://i.imgur.com/E4GwUGE.gif)

![](https://i.imgur.com/UbstdAD.gif)

![](https://i.imgur.com/bLXFn89.gif)

![](https://i.imgur.com/matC991.gif)

No model, no rollouts, a _single randomly-generated_ reward function gets us all of this. And it doesn't even take any more training time. Preserving the AU of a _single_ auxiliary reward function. Right now, we've got PPO-AUP flawlessly completing most of the randomly generated levels (although there are some generalization issues we're looking at, I think it's an RL problem, not an AUP problem).

To be frank, this is crazy. I'm not aware of any existing theory explaining these results, which is why I proved a bajillion theorems last summer to start to get a formal understanding (some of which became [the results on instrumental convergence and power-seeking](https://arxiv.org/abs/1912.01683)).

Here's the lowdown. Consider any significant change to the level. For the same reason that instrumental convergence happens, this change probably tweaks the attainable utilities of a lot of different reward functions. Imagine that the green cells start going nuts because of action:

![](https://www.partnershiponai.org/wp-content/uploads/2019/12/benchmark-prune-still-003_p0.gif)

> This is PPO shown, not AUP.

A lot of the time, it's very hard to undo what you just did. While it's also hard to undo significant actions you take for your primary goal, you get directly rewarded for those. So, preserving the AU of a random goal usually persuades you to not make "unnecessary changes" to the level.

I think this is strong evidence that AUP doesn't fit into the ontology of classical reinforcement learning theory; it isn't really about state reachability. It's _about_ not changing the AU landscape more than necessary, and this notion should scale even further.[^4]

> [!quote]
>
> Suppose we train an agent to handle vases, and then to clean, and then to make widgets with the equipment. Then, we deploy an AUP agent with a more ambitious primary objective and the learned Q-functions of the aforementioned auxiliary objectives. The agent would apply penalties to modifying vases, making messes, interfering with equipment, and so on.
>
> Before AUP, this could only be achieved by e.g. specifying penalties for the litany of individual side effects or providing negative feedback after each mistake has been made (and thereby confronting a credit assignment problem). In contrast, once provided the Q-function for an auxiliary objective, the AUP agent becomes sensitive to all events relevant to that objective, applying penalty proportional to the relevance.
>
> [_Conservative Agency_](https://arxiv.org/abs/1902.09725)

Maybe we provide additional information in the form of specific reward functions related to things we want the agent to be careful about, but maybe not (as was the case with the gridworlds and with SafeLife). Either way, I'm pretty optimistic about AUP basically solving the side-effect avoidance problem for infra-human AI (as posed in [_Concrete Problems in AI Safety_](https://arxiv.org/pdf/1606.06565v1.pdf)).

Edit 6/15/21: These results [were later accepted as a spotlight paper in NeurIPS 2020](/avoiding-side-effects-in-complex-environments).

Also, I think AUP will probably solve a significant part of the side-effect problem for infra-human AI in the single-principal/single-agent case, but I think it'll run into trouble in non-embodied domains. In the embodied case where the agent physically interacts with nearby objects, side effects show up in the agent's auxiliary value functions. The same need not hold for effects which are distant from the agent (such as across the world), and so that case seems harder.

(end edit)

## Appendix: The Reward Specification Game

When we're trying to get the RL agent to do what we want, we're trying to specify the right reward function.

> The specification process can be thought of as an iterated game. First, the designers provide a reward function. The agent then computes and follows a policy that optimizes the reward function. The designers can then correct the reward function, which the agent then optimizes, and so on. Ideally, the agent should maximize the reward over time, not just within any particular round – in other words, it should minimize regret for the correctly specified reward function over the course of the game.

![](https://i.imgur.com/d79VKqf.png)

In terms of outer alignment, there are two ways this can go wrong: the agent becomes less able to do the right thing (has negative side effects),

![](https://i.imgur.com/rXOjp4n.png)

or we become less able to get the agent to do the right thing (we lose power):

![](https://i.imgur.com/vW3Mwho.png)

For infra-human agents, AUP deals with the first by penalizing decreases in auxiliary AUs and with the second by penalizing increases in auxiliary AUs. The latter is a special form of corrigibility which involves not steering the world too far away from the status quo: while AUP agents are generally off-switch corrigible, they don't necessarily avoid manipulation (as long as they aren't gaining power).[^5]

<hr/>


1.  Reminder: side effects are [an unnatural kind](/world-state-is-the-wrong-abstraction-for-impact#Appendix-Avoiding-Side-Effects), but a useful abstraction for our purposes here. [↩︎](#fnref-BZhif26wG8PM3fueA-1)
    
2.  Let $\mathcal{R}$ be the uniform distribution over $[0,1]^\mathcal{S}$. In _Conservative Agency_, the penalty for taking action $a$ is a Monte Carlo integration of
    
    
$$
    \text{Penalty}(s,a):= \int_\mathcal{R} |Q^*_R(s,a) - Q^*_R(s,\varnothing)| \text{ d}R.
    
$$
    
    This is provably lower bounded by how much $a$ is expected to change the agent's power compared to inaction; this helps justify our reasoning that the AU penalty is primarily controlled by power changes. [↩︎](#fnref-BZhif26wG8PM3fueA-2)
    
3.  There is one weird thing that's been pointed out, where stepwise inaction while driving a car leads to not-crashing being penalized at each time step. I think this is because you need to use an appropriate inaction rollout policy, not because stepwise itself is wrong. [↩︎](#fnref-BZhif26wG8PM3fueA-3)
    
4.  Rereading [_World State is the Wrong Level of Abstraction for Impact_](/world-state-is-the-wrong-abstraction-for-impact) (while keeping in mind the AU landscape and the results of AUP) may be enlightening. [↩︎](#fnref-BZhif26wG8PM3fueA-4)
    
5.  SafeLife is evidence that AUP allows interesting policies, which is (appropriately) a key worry about the formulation. [↩︎](#fnref-BZhif26wG8PM3fueA-5)