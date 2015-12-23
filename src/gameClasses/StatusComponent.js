function StatusComponent()
{
  this.classId = 'StatusComponent';
  this.componentId = 'status';

  // streamInitData will be made from streamCreateData when the
  // entity is being created through network stream on the client
  this.init = function (entity, options) {
    //IgeEntity.prototype.init.call(this);
    var self = this;

    // // Store the entity that this component has been added to
    // this._entity = entity;
    // // Store any options that were passed to us
    // this._options = options;

    this.health = 100;
    this.power = 100;
  }
}

var StatusComponent = IgeEntity.extend(new StatusComponent());
if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined')
{
  module.exports = StatusComponent;
}
