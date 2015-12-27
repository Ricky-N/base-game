function Ability()
{
  this.cooldown = 1000; // ms
  this._lastUsed = 0; // ticks
  this._onCooldown = true;

  this.onCooldown = function()
  {
    // TODO: is this actually more efficient?
    if(!this._onCooldown)
    {
      return false;
    }
    else
    {
      // automatically takes itself off of cooldown, but note that
      // we must set this._onCooldown = true to ever get here
      this._onCooldown = this.cooldownTime() < this.cooldown;
      return this._onCooldown;
    }
  };

  this.cooldownTime = function()
  {
    return ige.lastTick - this._lastUsed;
  };

  this.use = function()
  {
    if(!this.onCooldown() && this.useCost())
    {
      this._onCooldown = true;
      this._lastUsed = ige.lastTick;
      this.onUse();
    }
  };

  /**
   * If possible, claims cost for using this ability
   * @return {Boolean} whether possible to use the ability
   */
  this.useCost = function()
  {
    throw "Ability.useCost() must be overridden by Ability instances";
  };

  /**
   * Function called when ability is used, off cooldown, and useCost is satisfied
   */
  this.onUse = function()
  {
    throw "Ability.onUse() must be overridden by Ability instances";
  };
}

function AbilityComponent()
{
   this.classId = "AbilityComponent";
   this.componentId = "abilitySet";

   this.init = function (entity, options) {
    var self = this;

    this._entity = entity;
    this._options = options;

    // players have a fixed number of abilities
    this.abilities = [];

    // TODO, ability base and inherited classes of abilities!
    // damage self by 10
    this.abilities[0] = new Ability();
    this.abilities[0].onUse = function()
    {
      var status = self._entity.status;
      status.health(status.health() - 10);
    };
    this.abilities[0].useCost = function()
    {
      // for now costs nothing to use and always succeeds
      return true;
    };

    // heal 30% of missing health
    this.abilities[1] = new Ability();
    this.abilities[1].onUse = function()
    {
      var status = self._entity.status;
      status.health(status.health() + 0.30 * (100 - status.health()));
    };
    this.abilities[1].useCost = function()
    {
      var status = self._entity.status;
      if(status.power() > 20)
      {
        status.power(status.power() - 20);
        return true;
      }
      return false;
    };
  };
}

var AbilityComponent = IgeEntity.extend(new AbilityComponent());
if (typeof(module) !== "undefined" && typeof(module.exports) !== "undefined")
{
  module.exports = AbilityComponent;
}
