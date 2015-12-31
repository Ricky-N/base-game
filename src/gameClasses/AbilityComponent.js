function Ability()
{
  this.classId = "Ability";
  this.controlType = "PressControl";

  this.init = function(name, entity, cooldown, costType, cost)
  {
    this.name = name;
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
      return this.cooldown;
    }
    // TODO: we should maybe return some failure status code?
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

  this.init = function(name, entity, cooldown, costType, cost)
  {
    Ability.prototype.init.call(this, name, entity, cooldown, costType, cost);
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
    ret.push({
      name: abilitySet.abilities[i].name,
      controlType: abilitySet.abilities[i].controlType
    });
  }
  return ret;
}

function Daggers(entity)
{
  var daggers = new ProjectileAbility("daggers", entity, 2000, "power", 10);
  daggers.projectileInfo = {
    category: "large", speed: 0.5, height: 32, width: 32,
    damage: 23, lifeSpan: 900, cellRow: 13, cellCol: 4
  };
  return daggers;
}

function Heal(entity)
{
  // heal 30% of missing health
  var heal = new Ability("heal", entity, 2000, "power", 20);
  // because this ability is linked to a toggleclickcontrol
  // we will receive a point with it where they clicked
  heal.onUse = function()
  {
    var status = entity.status;
    status.health(status.health() + 0.30 * (100 - status.health()));
  };
  return heal;
}

function Dash(entity)
{
  // TODO there is something wrong with this!!! it sometimes won't dash
  var dash = new Ability("dash", entity, 3500, "power", 9);
  dash.controlType = "ToggleClickControl";
  dash.onUse = function(point)
  {
    // TODO: this seems pretty common, refactor in some way
    var entityPosition = entity.worldPosition();
    var direction = Math2d.subtract(point, entityPosition);
    var norm = Math2d.normalize(direction);
    var velocity = Math2d.scale(norm, 20);

    entity.status._movementEnabled = false;
    entity.status._dashing = true;
    entity._box2dBody.SetLinearVelocity(velocity);
    setTimeout(function()
    {
      entity.status._movementEnabled = true;
      entity.status._dashing = false;
      entity._box2dBody.SetLinearVelocity(new Vector2d(0,0));
    }, 300);
  };
  return dash;
}

function Rocks(entity)
{
  var auto = new ProjectileAbility("rocks", entity, 1000, "power", 1.5);
  auto.controlType = "ToggleClickControl";
  auto.projectileInfo = {
    category: "small", speed: 0.7, height: 10, width: 10,
    damage: 6, lifeSpan: 500, cellRow: 6, cellCol: 4
  };
  // costs nothing, lets make it explicit and efficient
  // auto.useCost = function(){ return true; };
  return auto;
}

function Spikes(entity)
{
  var auto = new Ability("spikes", entity, 1500, "power", 15);
  //auto.useCost = function(){ return true; };
  var pos = { x: entity.translate().x(), y: entity.translate().y };
  auto.attackField = new DamageField({
    parentId: entity.id(),
    activeSpan: 300,
    damage: 30,
    position: { x: pos.x, y: pos.y }
  });
  entity.followingChildren.push(auto.attackField);
  var self = auto;
  auto.onUse = function(point)
  {
    self.attackField.activate();
  };
  return auto;
}

var optionMapping = {
  "daggers": Daggers,
  "spikes": Spikes,
  "heal": Heal,
  "rocks": Rocks,
  "dash": Dash
};

// AbilityComponent is server side only because we don't want every
// player to be able to see every other player's abilities or ability
// metadata. Instead we just send it on character init to only that player
function AbilityComponent()
{
   this.classId = "AbilityComponent";
   this.componentId = "abilitySet";

   this.init = function (entity, options) {
    var self = this;

    this._entity = entity;
    this._options = options;

    // we have to be very careful about the input here, which comes
    // directly from clients for now, so that we don't screw it up.
    var defaults = ["rocks", "daggers", "heal", "dash"];
    var abilityChoices = [];
    if(options.abilities)
    {
      for(var i = 0; i < 4; i++)
      {
        if(options.abilities[i] &&
             optionMapping.hasOwnProperty(options.abilities[i]))
        {
          abilityChoices[i] = options.abilities[i];
        }
        else
        {
          abilityChoices[i] = defaults[i];
        }
      }
    }
    else
    {
      abilityChoices = defaults;
    }

    this.abilities = [];
    for(var i = 0; i < abilityChoices.length; i++)
    {
      this.abilities[i] = new optionMapping[abilityChoices[i]](entity);
    }
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
