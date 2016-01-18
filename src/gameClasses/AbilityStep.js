/**
 * Completely describes a single step in an ability. Abilities
 * may have more than one step, but each step consists
 * of a type of ability along with additional parameters that
 * will be passed to the ability and help tune it. The total
 * power for each AbilityStep must be less than or equal to 1,
 * and in game will be scaled appropriately based on the profile
 * of the ability.
 * @class
 */
function AbilityStep(name, type, params)
{
  /** @property {string} name the name of this step */
  this.name = name;
  /** @property {type} type the type of ability for this step */
  this.type = type;
  /** @property {params} params the ability params */
  this.params = params;

  /**
   * Each ability step must conform to a power allocation of
   * at most 1 across the different possible settings for the ability
   */
  this.validateSettings = function()
  {
    // assume we only have relevant parameters
    var totalAllocation = 0;
    for(var prop in this.params)
    {
      if(this.hasOwnProperty(prop) && typeof this.params[prop] === "number")
      {
        totalAllocation += this.params[prop];
      }
    }

    if(totalAllocation > 1)
    {
      return false;
    }

    // each ability has required parameters, let's make sure those
    // are satisfied here as well
    return Abilities[this.type].validate(params);
  };
}

if (typeof(module) !== "undefined" && typeof(module.exports) !== "undefined")
{
	module.exports = AbilityStep;
}
