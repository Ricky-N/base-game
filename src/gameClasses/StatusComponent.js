function StatusComponent()
{
   this.classId = "StatusComponent";
   this.componentId = "status";

   this.init = function (entity, options) {
     var self = this;

    // don't care too much about these for now
     // // Store the entity that this component has been added to
     // this._entity = entity;
     // // Store any options that were passed to us
     // this._options = options;
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
    if(val)
    {
      this._health = val;
      this._change("healthChange");
    }
    else
    {
      return this._health;
    }
  };

  this.power = function(val)
  {
    if(val)
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
