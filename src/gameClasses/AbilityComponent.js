function Ability()
{
  this.classId = "Ability";
  this.controlType = "PressControl";

  this.init = function(entity, cooldown, costType, cost)
  {
    this.cooldown = cooldown; // ms
    this._lastUsed = 0; // ticks
    this._onCooldown = false;

    this._entity = entity;
    this.costType = costType;
    this.cost = cost;
  };

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

  this.use = function(arg)
  {
    if(!this.onCooldown() && this.useCost())
    {
      this._onCooldown = true;
      this._lastUsed = ige.lastTick;
      this.onUse(arg);
    }
  };

  /**
   * If possible, claims cost for using this ability
   * @return {Boolean} whether possible to use the ability
   */
  this.useCost = function()
  {
    return AbilityCostFunctions[this.costType](this._entity, this.cost);
  };

  /**
   * Function called when ability is used, off cooldown, and useCost is satisfied
   */
  this.onUse = function()
  {
    throw "Ability.onUse() must be overridden by Ability instances";
  };
}
var Ability = IgeClass.extend(new Ability());

var AbilityCostFunctions = {
  power: function(entity, cost)
  {
    var status = entity.status;
    if(status.power() >= cost)
    {
      status.power(status.power() - cost);
      return true;
    }
    return false;
  }
};

function ProjectileAbility()
{
  this.classId = "ProjectileAbility";
  this.controlType = "ToggleClickControl";

  this.init = function(entity, cooldown, costType, cost)
  {
    Ability.prototype.init.call(this, entity, cooldown, costType, cost);
  };

  this.onUse = function(point)
  {
    var entityPosition = this._entity.worldPosition();

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
    this.projectileInfo.position = pos;
    this.projectileInfo.direction = norm;
    new Projectile(this.projectileInfo);
  };

  // default projectileInfo must be overridden with appropriate
  // projectile properties for this to work. Left this way to help
  // speed things up a bit on initialization
  // this.projectileInfo = {
  //   category: "large", speed: 0.5, height: 32, width: 32,
  //   damage: 23, lifeSpan: 900, cellRow: 13, cellCol: 4
  // };
}
var ProjectileAbility = Ability.extend(new ProjectileAbility());

function getControlMetadata(abilitySet)
{
  var ret = [];
  for(var i = 0; i < abilitySet.abilities.length; i++)
  {
    ret.push(abilitySet.abilities[i].controlType);
  }
  return ret;
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
    this.abilities[0] = new ProjectileAbility(entity, 2000, "power", 10);
    this.abilities[0].projectileInfo = {
      category: "large", speed: 0.5, height: 32, width: 32,
      damage: 23, lifeSpan: 900, cellRow: 13, cellCol: 4
    };

    // // heal 30% of missing health
    // this.abilities[1] = new Ability(entity, 2000, "power", 20);
    // // because this ability is linked to a toggleclickcontrol
    // // we will receive a point with it where they clicked
    // this.abilities[1].onUse = function()
    // {
    //   var status = self._entity.status;
    //   status.health(status.health() + 0.30 * (100 - status.health()));
    // };

    // TODO there is something wrong with this!!! it sometimes won't dash
    this.abilities[1] = new Ability(entity, 3500, "power", 15);
    this.abilities[1].controlType = "ToggleClickControl";
    this.abilities[1].onUse = function(point)
    {
      // TODO: this seems pretty common, refactor in some way
      var entityPosition = self._entity.worldPosition();
      var direction = Math2d.subtract(point, entityPosition);
      var norm = Math2d.normalize(direction);
      var velocity = Math2d.scale(norm, 20);

      self._entity.status._movementEnabled = false;
      self._entity.status._dashing = true;
      self._entity._box2dBody.SetLinearVelocity(velocity);
      setTimeout(function()
      {
  			self._entity.status._movementEnabled = true;
        self._entity.status._dashing = false;
        self._entity._box2dBody.SetLinearVelocity(new Vector2d(0,0));
      }, 300);
    };

    // this.autoAttack = new ProjectileAbility(entity, 1000);
    // this.autoAttack.projectileInfo = {
    //   category: "small", speed: 0.7, height: 10, width: 10,
    //   damage: 3, lifeSpan: 500, cellRow: 6, cellCol: 4
    // };
    // // costs nothing, lets make it explicit and efficient
    // this.autoAttack.useCost = function(){ return true; };

    this.autoAttack = new Ability(entity, 1500);
    this.autoAttack.useCost = function(){ return true; };
    // this._attacking = false;
    // this._charactersInAttackRange = {};
    var pos = { x: entity.translate().x(), y: entity.translate().y() };
    this.attackField = new DamageField({
      parentId: entity.id(),
      activeSpan: 300,
      damage: 10,
      position: { x: pos.x, y: pos.y }
    });
    entity.followingChildren.push(this.attackField);
    this.autoAttack.onUse = function(point)
    {
      self.attackField.activate();
    };
  };

  this.getControlMetadata = function()
  {
    return getControlMetadata(this);
  };
}

var AbilityComponent = IgeEntity.extend(new AbilityComponent());
if (typeof(module) !== "undefined" && typeof(module.exports) !== "undefined")
{
  module.exports = AbilityComponent;
}
