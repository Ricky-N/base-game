/**
 * Contains all information required to build the desired character ability.
 * In the case of a player, this should come from the player's ability
 * editor information. This information should also be sufficient to
 * generate an ability profile that will be used by the global balancer
 * to appropriately balance different types of abilities
 * @class
 */
function AbilitySelection()
{
  /**
   * An ability can have multiple steps that execute
   * sequentially. Simple abilities should have just one
   * step and balancing should ensure that the added
   * power of a step appropriately affects the remaining power.
   */
  //this.steps = [];
}

if (typeof(module) !== "undefined" && typeof(module.exports) !== "undefined")
{
	module.exports = AbilitySelection;
}
