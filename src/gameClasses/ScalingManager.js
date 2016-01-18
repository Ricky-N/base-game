/**
 * This class is mostly a shim until the true scaling
 * manager can be developed, but it makes sure that we
 * get at least some sort of object in the middle here.
 * The eventual class should adapt to signals coming from
 * the centralized scaling service that determines how
 * powerful each global and local ability is for each component.
 */
function ScalingManager()
{
  /**
   * global scaling should have an
   * entry for every possible type of
   * ability component that acts as
   * the "baseline" for that type of
   * ability across the board.
   */
  this._globalScaling = {
    "cd": 1000,
    "cost": 10,
    "heal": 10,
    "missingHealth": 0.3,
    "duration": 300,
    "speed": 10,
    "damage": 15
  };

  /**
   * local scaling should have an entry
   * for each ability with the scaling
   * for each ability component based on
   * that ability. This is what identifies
   * the uniqueness about each ability type and
   * that ability's baseline
   */
  this._localScaling = {
    "Heal": {
      "cd": 2,
      "cost": 2,
      "heal": 1.5,
      "missingHealth": 3
    },
    "Dash": {
      "cd": 2.5,
      "cost": 1,
      "duration": 1,
      "speed": 2
    },
    "Spikes": {
      "cd": 1,
      "cost": 1.5,
      "duration": 1,
      "damage": 2.5,
      "missingHealth": 1
    },
    "Explosion": {
      "cd": 2,
      "cost": 2,
      "duration": 1,
      "damage": 1.5
    }
  };
}

if (typeof(module) !== "undefined" && typeof(module.exports) !== "undefined")
{
	module.exports = new ScalingManager();
}
