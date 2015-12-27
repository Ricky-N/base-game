function StatusComponent()
{
   this.classId = "StatusComponent";
   this.componentId = "status";

   this.init = function (entity, options) {
    var self = this;
    this._entity = entity;
    this._options = options;

    this.changeListeners = {};

    this.changeListeners.healthChange = {
      "callbacks": [],
      "member": "_health"
    };
    this._health = 100;

    this.changeListeners.powerChange = {
      "callbacks": [],
      "member": "_power"
    };
    this._power = 100;

    this.changeListeners.death = {
      "callbacks": [],
      "member": "_health"
    };
  };

  this.on = function(changeType, callback)
  {
    if(this.changeListeners.hasOwnProperty(changeType))
    {
      this.changeListeners[changeType].callbacks.push(callback);
    }
  };

  this._change = function(changeType)
  {
    var listeners = this.changeListeners[changeType];
    var len = listeners.callbacks.length;
    for(var i = 0; i < len; i++)
    {
      listeners.callbacks[i](this[listeners.member]);
    }
  };

  this.health = function(val)
  {
    if(typeof val !== "undefined" && val !== this._health)
    {
      // only allow setting health if they aren't dead
      if(this._health > 0)
      {
        this._health = val;
        this._change("healthChange");

        if(this._health <= 0)
        {
          this._entity.lifeSpan(1000);
          this._change("death");
        }
      }
    }
    else
    {
      return this._health;
    }
  };

  this.power = function(val)
  {
    if(typeof val !== "undefined" && val !== this._power)
    {
      this._power = val;
      this._change("powerChange");
    }
    else
    {
      return this._power;
    }
  };
}

var StatusComponent = IgeEntity.extend(new StatusComponent());
if (typeof(module) !== "undefined" && typeof(module.exports) !== "undefined")
{
  module.exports = StatusComponent;
}
