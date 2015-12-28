function Ability()
{
  var self = this;
  self.cooldown = 2000; // ms
  self._lastUsed = 0; // ticks
  self._onCooldown = true;

  this.onCooldown = function()
  {
    // TODO: is this actually more efficient?
    if(!self._onCooldown)
    {
      return false;
    }
    else
    {
      // automatically takes itself off of cooldown, but note that
      // we must set this._onCooldown = true to ever get here
      self._onCooldown = self.cooldownTime() < self.cooldown;
      return self._onCooldown;
    }
  };

  this.cooldownTime = function()
  {
    return ige.lastTick - self._lastUsed;
  };

  this.use = function(arg)
  {
    if(!self.onCooldown() && self.useCost())
    {
      self._onCooldown = true;
      self._lastUsed = ige.lastTick;
      self.onUse(arg);
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
    // because this ability is linked to a toggleclickcontrol
    // we will receive a point with it where they clicked
    this.abilities[0].onUse = function(point)
    {
      var entityPosition = self._entity.worldPosition();

      // get the vector pointing from entity to clicked point
      var direction = Math2d.subtract(point, entityPosition);
      var norm = Math2d.normalize(direction);

      // we don't want the projectile to overlap our entity, so place it starting
      // at closest distance we can, which is basically the straight line distance
      // to the entity of the corner's bounding box plus one
      // TODO: cache this!!!!
      // var bounds = self._entity.bounds2d();
      // var minSafeDistance = Math2d.pythagoras(bounds) + 5;
      // //Math2d.scale(norm, minSafeDistance));
      var pos = Math2d.add(entityPosition, Math2d.scale(norm, 50));
      new Projectile({
        position: pos, direction: norm, category: "large",
        speed: 0.5, height: 32, width: 32, damage: 23,
        lifeSpan: 900, cellRow: 13, cellCol: 4
      });
    };
    this.abilities[0].useCost = function()
    {
      var status = self._entity.status;
      if(status.power() >= 10)
      {
        status.power(status.power() - 10);
        return true;
      }
      return false;
    };

    // heal 30% of missing health
    this.abilities[1] = new Ability();
    // because this ability is linked to a toggleclickcontrol
    // we will receive a point with it where they clicked
    this.abilities[1].onUse = function(point)
    {
      var status = self._entity.status;
      status.health(status.health() + 0.30 * (100 - status.health()));
    };
    this.abilities[1].useCost = function()
    {
      var status = self._entity.status;
      if(status.power() >= 20)
      {
        status.power(status.power() - 20);
        return true;
      }
      return false;
    };

    // auto attack
    this.abilities[2] = new Ability();
    this.abilities[2].onUse = function(point)
    {
      // TODO clean!!!
      var entityPosition = self._entity.worldPosition();

      // get the vector pointing from entity to clicked point
      var direction = Math2d.subtract(point, entityPosition);
      var norm = Math2d.normalize(direction);

      // we don't want the projectile to overlap our entity, so place it starting
      // at closest distance we can, which is basically the straight line distance
      // to the entity of the corner's bounding box plus one
      // TODO: cache this!!!!
      // var bounds = self._entity.bounds2d();
      // var minSafeDistance = Math2d.pythagoras(bounds) + 5;
      // //Math2d.scale(norm, minSafeDistance));
      var pos = Math2d.add(entityPosition, Math2d.scale(norm, 50));
      new Projectile({
        position: pos, direction: norm, category: "small",
        speed: 0.7, height: 10, width: 10, damage: 3,
        lifeSpan: 500, cellRow: 6, cellCol: 4
      });
    };
    this.abilities[2].useCost = function(){ return true; };
    this.abilities[2].cooldown = 1000;
  };
}

var AbilityComponent = IgeEntity.extend(new AbilityComponent());
if (typeof(module) !== "undefined" && typeof(module.exports) !== "undefined")
{
  module.exports = AbilityComponent;
}
