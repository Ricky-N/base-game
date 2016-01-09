/**
 * An area with a physics sensor on the server and animation on
 * the client that tracks when characters enter and leave it's area.
 * Can be activated so that damage is dealt to anything in the area
 * while it is activated, and the animation is displayed
 * @class
 */
function DamageField()
{
  this.classId = "DamageField";

  /**
   * Initialize a DamageField
   * @param {object} create on server should have a position, activeSpan
   *   damage amount, and parent if the parent should not receive damage
   */
  this.init = function(create)
  {
    IgeEntityBox2d.prototype.init.call(this);
    var self = this;

    if(ige.isClient){ create = JSON.parse(create); }

    this.parentId = create.parentId;
    var parent = ige.$(create.parentId);
    this.activeSpan = create.activeSpan;

		/* CEXCLUDE */
    if(ige.isServer)
    {
      this.mount(ige.server.foregroundScene);
      this.height(96);
      this.width(96);

      this.translate().x(create.position.x);
      this.translate().y(create.position.y);

      this._active = false;
      this._charactersInRange = {};
      this._damage = create.damage;
      this.box2dBody(this._physicsSettings);

      this.streamMode(1);
    }
		/* CEXCLUDE */
    if(ige.isClient)
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

	/* CEXCLUDE */
  /**
   * Physics settings for the damage field. The damage field has
   * only a single fixture which is a sensor, meaning that it does
   * not collide with other objects, but still triggers when objects
   * would begin collision or leave.
   */
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
      shape: { type: "rectangle" },
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
	/* CEXCLUDE */

  /**
   * Activate the damage field for the activeSpan ms, hurting anything
   * that is already in the area or anything that enters the area while
   * it is active, and triggering the animation on the client
   * @param {Vector2d} position the location this should be centered at
   */
  this.activate = function(position)
  {
    var self = this;
		/* CEXCLUDE */
    if(ige.isServer)
    {
      this.translateTo(position.x, position.y, 0);

      this._active = true;
      ige.network.send("activate", this.id());

      for(var id in this._charactersInRange)
      {
        if(this._charactersInRange.hasOwnProperty(id))
        {
          var status = ige.$(id).status;
          status.health(status.health() - this._damage);
        }
      }

      setInterval(function()
      {
        self.deactivate();
      }, this.activeSpan);
    }
		/* CEXCLUDE */
    if(ige.isClient)
    {
      setTimeout(function(){
        self.animation.start("play");
      }, ige.client.renderLatency);
    }
  };

	/* CEXCLUDE */
  /**
   * Deactivate the DamageField, currently does not communicate
   * with the client to stop animation.
   */
  this.deactivate = function()
  {
    if(ige.isServer)
    {
      this._active = false;
    }
  };

  /**
   * Call when a character enters the DamageField range, if it is
   * active they will be hurt unless they are the parent, if inactive
   * they will be added to the set of characters in the range.
   * @param {number} id the id of the character that entered the range
   */
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

  /**
   * The opposite of entering the range
   * @param {number} id the id of the character leaving the range
   */
  this.characterLeftRange = function(id)
  {
    if(id !== this.parentId)
    {
      delete this._charactersInRange[id];
    }
  };
	/* CEXCLUDE */
}
var DamageField = IgeEntityBox2d.extend(new DamageField());

if (typeof(module) !== "undefined" && typeof(module.exports) !== "undefined")
{
  module.exports = DamageField;
}
