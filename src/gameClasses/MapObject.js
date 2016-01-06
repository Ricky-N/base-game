/**
 * An entity that will never move throughout its lifetime, but
 * still impacts the physics simulation and should be depth sorted,
 * making it inherently different from a map tile texture
 * @class
 */
function MapObject()
{
  this.classId = "MapObject";

  /**
   * Initialize a MapObject
   * @param {object} create an object with sufficient information to load
   *  the required cellsheet, properly render on the client, and properly
   *  set body physics properties on the server
   */
  this.init = function(create)
  {
    var self = this;
    IgeEntityBox2d.prototype.init.call(this);

    if(ige.isServer)
    {
      this.translateTo(create.position.x, create.position.y, 0);

      /**
       * depth is set to the center of the provided physics shape for
       * this object, with some slight added randomness for overlapping objects
       */
      this.depth = create.position.y + create.shapeData.y + Math.random();
      this.sheetData = create.sheetData;
      this.mount(ige.server.foregroundScene);
      this.height(create.height);
      this.width(create.width);

      this._physicsSettings.fixtures[0].shape.data = create.shapeData;
      this.box2dBody(this._physicsSettings);

      /** We only stream these entities down on a network map request */
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

  /** Called to get stream init data, passed to init on client */
  this.streamCreateData = function()
  {
    return JSON.stringify({
      depth: this.depth,
      sheetData: this.sheetData,
      height: this.height(),
      width: this.width()
    });
  };

  /** Basic static physics settings common to all MapObjects */
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
