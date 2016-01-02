function MapObject()
{
  this.classId = "MapObject";

  // on server create is passed from new Projectile(create),
  // on client it comes from this.streamCreateData
  this.init = function(create)
  {
    var self = this;
    IgeEntityBox2d.prototype.init.call(this);

    if(ige.isServer)
    {
      this.translateTo(create.position.x, create.position.y, 0);

      // lets set depth at the center of mass of the static object, with a slight
      // randomness so side-by-side overlapping objects work out right
      this.depth = create.position.y + create.shapeData.y + Math.random();
      this.sheetData = create.sheetData;
      this.mount(ige.server.foregroundScene);
      this.height(create.height);
      this.width(create.width);

      this._physicsSettings.fixtures[0].shape.data = create.shapeData;
      this.box2dBody(this._physicsSettings);

      // TODO: stream this to the client on init
      // we never have to stream anything else about
      // MapObjects ever because they won't change
      //this.streamCreate(clientId);
      this.streamMode(2);

      // this.cellRow = create.cellRow;
      // this.cellCol = create.cellCol;
    }
    else // ige.isClient
    {
      create = JSON.parse(create);
      // this.cellRow = create.cellRow;
      // this.cellCol = create.cellCol;
      this.height(create.height);
      this.width(create.width);
      this.depth(create.depth);

      var managedTexture = ige.sheetManager.registerCallback(
        create.sheetData.location, function(texture){
          self.texture(texture);
          self.cell(create.sheetData.cell);
        }, create.sheetData.columns, create.sheetData.rows);
    }
  };

  this.streamCreateData = function()
  {
    return JSON.stringify({
      depth: this.depth,
      sheetData: this.sheetData,
      height: this.height(),
      width: this.width()
    });
  };

  this._physicsSettings = {
    type: "static",
    allowSleep: true,
    fixtures: [{
      shape: {
        type: "rectangle"
      }
    }]
  };

  // TODO: I don't think this is appropriate if a class is
  // using SheetManager as the sheets are shared, probably should
  // trim this code from all of my classes relying on that now.
  // this.destroy = function () {
  //   // Destroy the texture object
  //   if (this._projectileTexture) {
  //     this._.destroy();
  //   }
  //
  //   // Call the super class
  //   IgeEntityBox2d.prototype.destroy.call(this);
  // };
}
var MapObject = IgeEntityBox2d.extend(new MapObject());

if (typeof(module) !== "undefined" && typeof(module.exports) !== "undefined")
{
	module.exports = MapObject;
}
