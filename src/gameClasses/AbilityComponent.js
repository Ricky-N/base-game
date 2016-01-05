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
    // TODO: some failure status reason should be returned
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
    // TODO: implement and cache this
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

function Daggers(entity)
{
  var daggers = new ProjectileAbility("daggers", entity, 2000, "power", 10);
  daggers.projectileInfo = {
    category: "large", speed: 0.5, height: 32, width: 32,
    damage: 23, lifeSpan: 900, cellRow: 13, cellCol: 4
  };
  daggers.cellSheetInfo = {
    sheet: "./textures/tiles/tilee5.png",
    columns: 16,
    rows: 16,
  };
  return daggers;
}

function Heal(entity)
{
  // heal 30% of missing health
  var heal = new Ability("heal", entity, 2000, "power", 20);

  heal.onUse = function()
  {
    var status = entity.status;
    status.health(status.health() + 0.30 * (100 - status.health()));
  };
  return heal;
}

function Dash(entity)
{
  // TODO fix bug related to dash when standing still
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
  var rocks = new ProjectileAbility("rocks", entity, 1000, "power", 1.5);
  rocks.controlType = "ToggleClickControl";
  rocks.projectileInfo = {
    category: "small", speed: 0.7, height: 10, width: 10,
    damage: 6, lifeSpan: 500, cellRow: 6, cellCol: 4
  };
  rocks.cellSheetInfo = {
    sheet: "./textures/tiles/tilee5.png",
    columns: 16,
    rows: 16,
  };
  return rocks;
}

function Spikes(entity)
{
  var spikes = new Ability("spikes", entity, 1500, "power", 15);

  var pos = { x: entity.translate().x(), y: entity.translate().y };
  spikes.attackField = new DamageField({
    parentId: entity.id(),
    activeSpan: 300,
    damage: 30,
    position: { x: pos.x, y: pos.y }
  });
  entity.followingChildren.push(spikes.attackField);
  auto.onUse = function(point)
  {
    spikes.attackField.activate();
  };
  return spikes;
}

function Explosion(entity)
{
  var explosion = new Ability("explosion", entity, 2000, "power", 20);
  var pos = { x: entity.translate().x(), y: entity.translate().y };
  explosion.explosionField = new DamageField({
    activeSpan: 300,
    damage: 15,
    position: { x: 0, y: 0 } // TODO: first activation hits 0,0 for some reason
  });
  explosion.onUse = function(point)
  {
    explosion.explosionField.translateTo(point.x, point.y, 0);
    explosion.explosionField.activate();
  };
  return explosion;
}

var optionMapping = {
  "daggers": Daggers,
  "spikes": Spikes,
  "heal": Heal,
  "rocks": Rocks,
  "dash": Dash,
  "explosion": Explosion
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
    var abilityChoices = [], i;
    if(options.abilities)
    {
      for(i = 0; i < 4; i++)
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
    for(i = 0; i < abilityChoices.length; i++)
    {
      this.abilities[i] = new optionMapping[abilityChoices[i]](entity);
    }
  };

  // currently unused, but useful if we get off of click controls again
  this.getControlMetadata = function()
  {
    var ret = [];
    for(var i = 0; i < this.abilities.length; i++)
    {
      ret.push({
        name: this.abilities[i].name,
        controlType: this.abilities[i].controlType
      });
    }
    return ret;
  };

  // for things like projectiles we don't want to create a new
  // cell sheet every time the projectile is created, but we also
  // don't have a client side abilitySet to hold the reference. We
  // will pass back info here that the server can ship down
  this.getCellSheetInfo = function()
  {
    var cellSheetInfo = [];
    for(var i = 0; i < this.abilities.length; i++)
    {
      if(typeof this.abilities[i].cellSheetInfo !== "undefined")
      {
        cellSheetInfo.push(this.abilities[i].cellSheetInfo);
      }
    }
    return cellSheetInfo;
  };
}

var AbilityComponent = IgeEntity.extend(new AbilityComponent());
if (typeof(module) !== "undefined" && typeof(module.exports) !== "undefined")
{
  module.exports = AbilityComponent;
}
