// TODO: HUUUGEEEEE PERF PROBLEM CREATING AND DESTROYING THESE,
// WE NEED A PRECREATED POOL OF ENTITIES TO DRAW FROM
function Projectile()
{
  this.classId = "Projectile";

  this.init = function(createInfo)
  {
    var self = this;
    IgeEntityBox2d.prototype.init.call(this);

    if(ige.isServer)
    {
      this.speed = 0.4;
      this.height(32);
      this.width(32);

      this.translate().x(createInfo.position.x);
      this.translate().y(createInfo.position.y);

      this.addComponent(IgeVelocityComponent);
      this.mount(ige.server.foregroundScene);
      this.box2dBody(this._physicsSettings);
      this.streamMode(1);

      var direction = createInfo.direction;
      var vel = Math2d.scale(direction, this.speed);
      this.velocity.x(vel.x);
      this.velocity.y(vel.y);

      this.rotateTo(0,0,Math.atan2(direction.x, -direction.y) + Math.PI/2);

      this.damage = 20;
    }
    else // ige.isClient
    {
      // TODO: load this with the character, also this cell sheet has white space!!
      this._projectileTexture = new IgeCellSheet("./textures/tiles/tilee5.png", 16, 16);
      this._projectileTexture.on("loaded", function () {
        self.texture(self._projectileTexture)
          .cell(13 * 16 + 4)
          .dimensionsFromCell();
      }, false, true);

      ige.client.projectile = this;
    }

    // for now projectiles only live for 1 seconds!
    this.lifeSpan(1000);
  };

  this._physicsSettings = {
    type: "dynamic",
    linearDamping: 0.0,
    angularDamping: 0.1,
    allowSleep:true,
    bullet: false,
    fixedRotation: true,
    gravitic: true,
    fixtures: [{
      density: 1.0, friction: 0.5, restitution: 0.0,
      shape: {
        type: "rectangle"
      }
    }]
  };

  this.destroy = function () {
    // Destroy the texture object
    if (this._projectileTexture) {
      this._projectileTexture.destroy();
    }

    // Call the super class
    IgeEntityBox2d.prototype.destroy.call(this);
  };
}

var Projectile = IgeEntityBox2d.extend(new Projectile());
if (typeof(module) !== "undefined" && typeof(module.exports) !== "undefined")
{
	module.exports = Projectile;
}
