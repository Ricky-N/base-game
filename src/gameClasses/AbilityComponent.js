/** Maps from client provided options to ability constructors */
var optionMapping = {
  "daggers": Abilities.Daggers,
  "spikes": Abilities.Spikes,
  "heal": Abilities.Heal,
  "rocks": Abilities.Rocks,
  "dash": Abilities.Dash,
  "explosion": Abilities.Explosion
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

  /**
   * Modify the ability with the given index to the provided
   * ability selection metadata
   * @param {number} index the ability index
   * @param {AbilitySelection} selection the new ability selection
   */
  this.updateAbility = function(index, selection)
  {
    throw "Not implemented";
  }
}

var AbilityComponent = IgeEntity.extend(new AbilityComponent());
if (typeof(module) !== "undefined" && typeof(module.exports) !== "undefined")
{
  module.exports = AbilityComponent;
}
