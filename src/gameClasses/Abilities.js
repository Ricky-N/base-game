/*jshint -W004 */
/**
 * The set of abilities that can be used in the game. Each ability
 * has a representation that helps players build that ability, a set
 * of paramters that must validate as being appropriate, and a enough
 * information to create and use it at game time
 * @class
 */
function Abilities()
{
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
      // check if using should even be possible
      if(!this.onCooldown() && this.useCost(false))
      {
        // the on use can return false to say use failed
        if(this.onUse(arg) !== false)
        {
          // now we want to actually apply use costs
          this.useCost(true);
          this._onCooldown = true;
          this._lastUsed = ige.lastTick;
          return this.cooldown;
        }
      }
      // TODO: some failure status reason should be returned
    };

    /**
     * if possible, claims cost for using this ability
     * @return {Boolean} whether possible to use the ability
     */
    this.useCost = function(apply)
    {
      return AbilityCostFunctions[this.costType](this._entity, this.cost, apply);
    };

    /**
     * function called when ability is used, off cooldown, and useCost is satisfied
     */
    this.onUse = function()
    {
      throw "Ability.onUse() must be overridden by Ability instances";
    };

    /**
     * each ability must provide the set of parameters and constraints
     * on those parameters so that we can generate a UI for picking them.
     * The ability must also be able to take parameters that were set and
     * appropriately validate and store them. If not overridden, it is
     * assumed that there are no tunable parameters for an ability
     */
    this.parameters = function(pars)
    {
      if(typeof pars === "undefined")
      {
        // no tunable parameters
        return [];
      }
      else
      {
        // and nothing to do when called
        return;
      }
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
    power: function(entity, cost, apply)
    {
      var status = entity.status;
      if(status.power() >= cost)
      {
        if(apply === true)
        {
          status.power(status.power() - cost);
        }
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

  /**
   * Generates a larger, slower flying projectile, should
   * probably be nuked once truly player set abilities are possible
   * @class
   */
  function Daggers()
  {
    this.classId = "Daggers";

    this.init = function(entity)
    {
      ProjectileAbility.prototype.init.call(
        this, "daggers", entity, 2000, "power", 10
      );
    };

    this.projectileInfo = {
      category: "large", speed: 0.5, height: 32, width: 32,
      damage: 23, lifeSpan: 900, cellRow: 13, cellCol: 4
    };

    this.cellSheetInfo = {
      sheet: "./textures/tiles/tilee5.png",
      columns: 16,
      rows: 16,
    };
  }
  this.Daggers = ProjectileAbility.extend(new Daggers());

  /**
   * Ability that heals for 30% of currently missing health
   * @class
   */
  function Heal()
  {
    this.classId = "Heal";

    this.init = function(entity)
    {
      Ability.prototype.init.call(this, "heal", entity, 2000, "power", 20);
    };

    this.onUse = function()
    {
      var status = this._entity.status;
      status.health(status.health() + 0.30 * (100 - status.health()));
    };
  }
  this.Heal = Ability.extend(new Heal());

  /**
   * Ability that gives a big velocity in target Direction
   * for a short period of time
   * @class
   */
  function Dash()
  {
    this.classId = "Dash";

    this.init = function(entity)
    {
      Ability.prototype.init.call(this, "dash", entity, 3500, "power", 9);
    };

    this.controlType = "ToggleClickControl";

    this.onUse = function(point)
    {
      // TODO fix bug related to dash when standing still
      // TODO: this seems pretty common, refactor in some way
      var entityPosition = this._entity.worldPosition();
      var direction = Math2d.subtract(point, entityPosition);
      var norm = Math2d.normalize(direction);
      var velocity = Math2d.scale(norm, 20);

      this._entity.status._movementEnabled = false;
      this._entity.status._dashing = true;
      this._entity._box2dBody.SetLinearVelocity(velocity);

      var self = this;
      setTimeout(function()
      {
        self._entity.status._movementEnabled = true;
        self._entity.status._dashing = false;
        self._entity._box2dBody.SetLinearVelocity(new Vector2d(0,0));
      }, 300);
    };
  }
  this.Dash = Ability.extend(new Dash());

  /**
   * Throws a smaller, faster, less damaging projectile
   * in the target direction, should probably be removed
   * once player defined abilities are set up better
   * @class
   */
  function Rocks()
  {
    this.classId = "Rocks";

    this.init = function(entity)
    {
      ProjectileAbility.prototype.init.call(
        this, "rocks", entity, 1000, "power", 1.5
      );
    };

    this.controlType = "ToggleClickControl";

    this.projectileInfo = {
      category: "small", speed: 0.7, height: 10, width: 10,
      damage: 6, lifeSpan: 500, cellRow: 6, cellCol: 4
    };

    this.cellSheetInfo = {
      sheet: "./textures/tiles/tilee5.png",
      columns: 16,
      rows: 16,
    };
  }
  this.Rocks = ProjectileAbility.extend(new Rocks());

  /**
   * Erupts spikes around the player greatly damaging
   * any other players close by
   * @class
   */
  function Spikes()
  {
    this.classId = "Spikes";

    this.init = function(entity)
    {
      Ability.prototype.init.call(this, "spikes", entity, 1500, "power", 15);

      this.attackField = new DamageField({
        parentId: entity.id(),
        activeSpan: 300,
        damage: 30,
        position: {
          x: entity._translate.x,
          y: entity._translate.y
        }
      });
      entity.followingChildren.push(this.attackField);
    };

    this.onUse = function(point)
    {
      this.attackField.activate();
    };
  }
  this.Spikes = Ability.extend(new Spikes());

  /**
   * Erupts spikes at target location within a certain
   * range dealing moderate damage
   * @class
   */
  function Explosion()
  {
    this.classId = "Explosion";

    this.init = function(entity)
    {
      Ability.prototype.init.call(this, "explosion", entity, 2000, "power", 20);
      this.maxRange = 300;

      this.field = new DamageField({
        activeSpan: 300,
        damage: 15,
        position: { x: 0, y: 0 } // TODO: first activation hits 0,0 for some reason
      });
    };

    this.onUse = function(point)
    {
      // calculate straight line distance to the object
      var connectingVector = Math2d.subtract(this._entity._translate, point);
      var distance = Math2d.pythagoras(connectingVector);
      if(distance <= maxRange)
      {
        this.field.activate(point);
      }
      else
      {
        return false;
      }
    };
  }
  this.Explosion = Ability.extend(new Explosion());
}

if (typeof(module) !== "undefined" && typeof(module.exports) !== "undefined")
{
	module.exports = new Abilities();
}
