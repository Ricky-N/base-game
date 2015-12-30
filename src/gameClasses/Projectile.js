// TODO: Perf problems creating and destroying these, make an initialized
// entity pool to deal with projectiles instead
function Projectile()
{
  this.classId = "Projectile";

  // on server create is passed from new Projectile(create),
  // on client it comes from this.streamCreateData
  this.init = function(create)
  {
    var self = this;
    IgeEntityBox2d.prototype.init.call(this);

    if(ige.isServer)
    {
      this.speed = create.speed;
      this.height(create.height);
      this.width(create.width);
      this.damage = create.damage;
      this.category = create.category;

      this.translate().x(create.position.x);
      this.translate().y(create.position.y);

      this.addComponent(IgeVelocityComponent);
      this.mount(ige.server.foregroundScene);
      this.box2dBody(this._physicsSettings);
      this.streamMode(1);

      var direction = create.direction;
      var vel = Math2d.scale(direction, this.speed);
      this.velocity.x(vel.x);
      this.velocity.y(vel.y);

      this.cellRow = create.cellRow;
      this.cellCol = create.cellCol;

      var rotation = Math.atan2(direction.x, -direction.y) + Math.PI/2;
      this.rotateTo(0,0, rotation);
    }
    else // ige.isClient
    {
      create = JSON.parse(create);
      this.cellRow = create.cellRow;
      this.cellCol = create.cellCol;

      // TODO: load this with the character, also this cell sheet has white space!!
      // for now, all projectiles live on the same cell sheet
      this._projectileTexture = new IgeCellSheet("./textures/tiles/tilee5.png", 16, 16);
      this._projectileTexture.on("loaded", function () {
        self.texture(self._projectileTexture);
        self.cell(self.cellRow * 16 + self.cellCol);
      }, false, true);
    }

    this.lifeSpan(create.lifeSpan);
  };

  this.streamCreateData = function()
  {
    return JSON.stringify({
      cellRow: this.cellRow,
      cellCol: this.cellCol,
      lifeSpan: this.lifeSpan()
    });
  };

  this._physicsSettings = {
    type: "kinematic",
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
      },
      filter: {
        categoryBits: 4,
        maskBits: 5
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
