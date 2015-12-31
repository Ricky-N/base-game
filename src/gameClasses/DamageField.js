function DamageField()
{
  this.classId = "DamageField";

  // on server create is passed from new Projectile(create),
  // on client it comes from this.streamCreateData
  this.init = function(create)
  {
    var self = this;
    IgeEntityBox2d.prototype.init.call(this);

    if(ige.isClient){ create = JSON.parse(create); }

    this.parentId = create.parentId;
    var parent = ige.$(create.parentId);
    this.activeSpan = create.activeSpan;

    field = this;

    if(ige.isServer)
    {
      this.mount(ige.server.foregroundScene);
      this.height(96);
      this.width(96);

      this.translate().x(create.position.x);
      this.translate().y(create.position.y);
      this.streamMode(1);

      this._active = false;
      this._charactersInRange = {};
      this._damage = create.damage;
      this.box2dBody(this._physicsSettings);
    }
    else // ige.isClient
    {
      this.addComponent(IgeAnimationComponent).depth(1);
      var managedTexture = ige.sheetManager.registerCallback(
        "./textures/tiles/spikes.png", function(texture){
          self.texture(texture);
          self.cell(self.cellRow * 16 + self.cellCol);

          self.texture(texture).dimensionsFromCell();
          self.animation.define("play", [1, 2, 3, 4, 3, 2, 1], 21, 0);
          self.hide();

          self.animation.on("started", function(anim)
          {
            self.show();
          });
          self.animation.on("complete", function(anim)
          {
            self.hide();
          });
        }, 1, 4);
    }
  };

  this._physicsSettings = {
    type: "kinematic",
    linearDamping: 0.0,
    angularDamping: 0.0,
    allowSleep:true,
    bullet: false,
    fixedRotation: true,
    gravitic: true,
    fixtures: [{
      density: 1.0, friction: 0.0, restitution: 0.0,
      isSensor: true,
      shape: {
        type: "rectangle"
      },
      filter: {
        categoryBits: 2,
        maskBits: 1
      }
    }]
  };

  this.streamCreateData = function()
  {
    var position = this.worldPosition();
    return JSON.stringify({
      parentId: this.parentId,
      activeSpan: this.activeSpan
    });
  };

  this.activate = function()
  {
    if(ige.isServer)
    {
      ige.network.send("activate", this.id());
      this._active = true;
      for(var id in this._charactersInRange)
      {
        if(this._charactersInRange.hasOwnProperty(id))
        {
          var status = ige.$(id).status;
          status.health(status.health() - this._damage);
        }
      }

      var self = this;
      setInterval(function()
      {
        self.deactivate();
      }, this.activeSpan);
    }
    else
    {
      this.animation.start("play");
    }
  };

  this.deactivate = function()
  {
    if(ige.isServer)
    {
      this._active = false;
    }
  };

  this.characterEnteredRange = function(id)
  {
    if(id !== this.parentId)
    {
      if(this._active)
      {
        var status = ige.$(id).status;
        status.health(status.health() - this._damage);
      }
      else
      {
        this._charactersInRange[id] = true;
      }
    }
  };

  this.characterLeftRange = function(id)
  {
    if(id !== this.parentId)
    {
      delete this._charactersInRange[id];
    }
  };

  this.destroy = function () {
    // Destroy the texture object
    if (this._fieldTexture) {
      this._fieldTexture.destroy();
    }

    // Call the super class
    IgeEntityBox2d.prototype.destroy.call(this);
  };
}
var DamageField = IgeEntityBox2d.extend(new DamageField());

if (typeof(module) !== "undefined" && typeof(module.exports) !== "undefined")
{
  module.exports = DamageField;
}
