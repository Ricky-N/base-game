# Abilities in This Game

I have tried to design an ability system that would lead to really fun
dynamic strategy building in real time combat. Hopefully we can get to a
point where everyone has a unique ability set that is determined by their
ideal play style, and that each ability set is balanced while rewarding
new ideas and not just sticking with the pack. Types of abilities should be
player selected from among a total set, along with an animation for that
ability and parameters that determine how much overall power that ability has.
By enabling chaining of multiple steps (individual type of abilities) within
a single ability, really unique combinations should show up. This will
require some good data science, metrics, and target metric values in order
for it to work out nicely.

I have considered a few scenarios when it comes to ability selection (what the
player says they want) and ability balancing (what the server decides they get)
that are reflected directly in the design.

1. As a player, if I select an ability type and tune the parameters for that
  ability type in some UI, I don't want to come back to see my selection
  has changed. This means player selections must purely act as partial
  coefficients or scaling indicators. Because we always want to limit them to
  some overall power for an ability (which may be automatically balanced), it
  makes sense to just allow the player to allocate percentages of that power
  to each tunable ability parameter. This means that any ability parameter p
  is bounded by 0 >= p >= 1 and SUM(p_i) = 1 for any player ability selection.

2. On the side of the balancer, we just have to imagine classes of imbalance
  that would need to be corrected at the ability level. I have thought of
  these several examples. First, imagine a characteristic of an ability is
  overpowered, like abilities with high speed are impossible to dodge and
  begin accruing too many kills, we may want to tune speed globally. Second
  imagine that a specific ability is too strong with the global parameter setting,
  like having a dash the same speed as a projectile may be unfair, this suggests
  we need local scaling of the global coefficient per ability. If we have local
  scaling though, there is every opportunity for the local scaling to be
  imbalanced, so that would need to be tunable as well.

From these two points, we can see that we need three different sets of
coefficients for every single tunable parameter:

1. The power allocation coming from the player, x{0,1}, sum(x) <= 1
2. The base ability parameters
3. The global ability parameters

Next we must consider that this tuning is only possible for ability properties
that not every ability has. For instance: how do we tell if cooldowns are simply
not right, in fact what is the definition of right here? I would say that this
is part of metric definition. For ability properties that are not global, I
believe the metric should be derived from kills and deaths. This will help to
ensure that the game feels relatively fair, or that nothing feels too broken.
But there is also a notion of how fun something is. It could be very fair but
not horribly fun, so we will need to track down indicators that people are
enjoying the pace of combat to understand what the right global cooldown scaling
would be. 
