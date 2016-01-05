function MapObject()
{
  this.classId = "MapObject";

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

      // We only stream these entities down when they request the map
      this.streamMode(2);
    }
    else // ige.isClient
    {
      create = JSON.parse(create);

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
      shape: { type: "rectangle" }
    }]
  };
}
var MapObject = IgeEntityBox2d.extend(new MapObject());

if (typeof(module) !== "undefined" && typeof(module.exports) !== "undefined")
{
	module.exports = MapObject;
}
