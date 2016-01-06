/** @class
 * A generic type of ability which has a cost, a cooldown, and can
 * be used. If the cost is not met, use will fail. The onUse Function
 * must be overridden by children when a new type of ability is created.
 */
function Ability()
{
  this.classId = "Ability";
  this.controlType = "PressControl";

  /**
   * Initializes the Ability, should be called by children
   * @param {string} name the ability name
   * @param {object} entity the entity this ability is associated with
   * @param {number} cooldown cooldown time in ms
   * @param {string} costType ability accessor for one of AbilityCostFunctions
   * @param {number} cost the cost in units of the costType
   */
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

  /**
   * Whether the ability is on cooldown or not
   * @returns {boolean} true if on cooldown
   */
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

  /**
   * cooldown time accessor
   * @returns length of time in ms until cooldown is up
   */
  this.cooldownTime = function()
  {
    return ige.lastTick - this._lastUsed;
  };

  /**
   * Checks if the ability is ready for use and if so calls onUse
   * @return {number} new cooldown time if used
   */
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
   * if possible, claims cost for using this ability
   * @return {Boolean} whether possible to use the ability
   */
  this.useCost = function()
  {
    return AbilityCostFunctions[this.costType](this._entity, this.cost);
  };

  /**
   * function called when ability is used, off cooldown, and useCost is satisfied
   */
  this.onUse = function()
  {
    throw "Ability.onUse() must be overridden by Ability instances";
  };
}
var Ability = IgeClass.extend(new Ability());

/**
 * Dictionary of ability cost functions that may be shared
 * across many different abilities
 * @property {function(object, number):boolean} power given the cost, returns
 *  whether an ability can be used or not
 */
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

/**
 * A special type of ability which spawns a projectile in
 * the direction specified by a given point. Information about
 * the projectile must be assigned to this to work properly
 * @augments Ability
 * @class
 */
function ProjectileAbility()
{
  this.classId = "ProjectileAbility";
  this.controlType = "ToggleClickControl";

  /**
   * Initializes the ProjectileAbility, see Ability for params
   */
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

  /**
   * default projectileInfo must be overridden with appropriate
   * projectile properties for this to work. Left blank to help
   * speed things up a bit on initialization
   * @property {string} category probably useless
   * @property {number} speed the speed of the projectile
   * @property {number} height the height of the hitbox
   * @property {number} width the width of the hitbox
   * @property {number} damage the amount of damage dealt on hit
   * @property {number} lifespan the time in ms this projectile is alive
   * @property {number} cellRow the row in the cellsheet
   * @property {number} cellCol the column in the cellsheet
   */
  this.projectileInfo = {};
  //   category: "large", speed: 0.5, height: 32, width: 32,
  //   damage: 23, lifeSpan: 900, cellRow: 13, cellCol: 4
  // };
}
var ProjectileAbility = Ability.extend(new ProjectileAbility());

// TODO: refactor into real classes and document
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
  var field = new DamageField({
    activeSpan: 300,
    damage: 15,
    position: { x: 0, y: 0 } // TODO: first activation hits 0,0 for some reason
  });
  explosion.onUse = function(point)
  {
    field.activate(point);
  };
  explosion.explosionField = field;
  return explosion;
}

/** Maps from client provided options to ability constructors */
var optionMapping = {
  "daggers": Daggers,
  "spikes": Spikes,
  "heal": Heal,
  "rocks": Rocks,
  "dash": Dash,
  "explosion": Explosion
};

/**
 * Server side only component of a character that gives it abilities.
 * kept hidden from the clients so that they can't determine anything
 * about their opponents before seeing the ability happen.
 * @class
 */
function AbilityComponent()
{
   this.classId = "AbilityComponent";
   this.componentId = "abilitySet";

   /**
    * Initialize a new AbilityComponent for a character. This should not be
    * called directly but through the entity's addComponent method.
    * @param {object} entity the entity this component is being added to
    * @param {object} options should have a property abilities that switches which
    *   abilities are initialized for this component
    */
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

    /** the set of abilities in this AbilityComponent */
    this.abilities = [];
    for(i = 0; i < abilityChoices.length; i++)
    {
      this.abilities[i] = new optionMapping[abilityChoices[i]](entity);
    }
  };

  /**
   * Used to get required information about the character's abilities to
   * initialize their PlayerComponent. Currently not relied on as all abilities
   * have been mapped to the homogenous click controls, but is the methods
   * to support PressControls, ToggleClickControls, etc.
   */
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

  /**
   * Returns information about cellsheets from the abilities in this
   * AbilityComponent which we may want to initialize before the ability is
   * called. This helps make sure that we aren't duplicating work to init
   * cellsheets or doing it during the spawn time of a short lived entity.
   */
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
