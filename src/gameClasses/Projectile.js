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
      // TODO clean up this hack.
      this.projectileType = createInfo.type;
      if(createInfo.type === "small")
      {
        this.classId("SmallProjectile");
        this.speed = 0.7;
        this.height(10);
        this.width(10);
        this.damage = 3;
      }
      else
      {
        this.speed = 0.5;
        this.height(32);
        this.width(32);
        this.damage = 23;
      }

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
    }
    else // ige.isClient
    {
      this.projectileType = JSON.parse(createInfo).projectileType;
      // TODO: load this with the character, also this cell sheet has white space!!
      this._projectileTexture = new IgeCellSheet("./textures/tiles/tilee5.png", 16, 16);
      this._projectileTexture.on("loaded", function () {
        self.texture(self._projectileTexture);
        if(self.projectileType === "small")
        {
          self.cell(6 * 16 + 4);
        }
        else
        {
          self.cell(13 * 16 + 4);
        }
        //self.dimensionsFromCell();
      }, false, true);

      ige.client.projectile = this;
    }

    if(this.ProjectileType === "small")
    {
      // for now projectiles only live for 1 seconds!
      this.lifeSpan(500);
    }
    else
    {
      this.lifeSpan(1300);
    }
  };

  this.streamCreateData = function()
  {
    return JSON.stringify({projectileType: this.projectileType});
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
