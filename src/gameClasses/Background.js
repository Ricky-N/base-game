function Background(mainScene){
  var self = this;
  self.scene = new IgeScene2d()
    .id("backgroundScene")
    .layer(0)
    .mount(mainScene);

  if(ige.isClient)
  {
    ige.addComponent(IgeTiledComponent);
    ige.network.request("requestMap", {}, function(commandName, data)
    {
      ige.tiled.loadJson(data, function(layers, layersById)
      {
        self.mapLayers = layersById;
        for(var i = 0; i < layers.length; i++)
        {
          // for now tile layers are our only visible layers
          if(layers[i].type === "tilelayer")
          {
            layers[i].tileWidth(32)
              .tileHeight(32)
              .autoSection(20)
              .drawBounds(false)
              .drawBoundsData(false)
              .drawMouse(true)
              .mount(self.scene);
          }
        }
      });
    });
  }
  else // ige.isServer
  {
    var physicsProperties = {
      type: "static",
      allowSleep: true,
      fixtures: [{
        shape: {
          type: "rectangle"
        }
      }]
    };

    // we already have the Map here just load it, we don"t
    // care about the rendering layers only objects for box2d
    self.objects = [];
    for(var i = 0; i < Map.layers.length; i++)
    {
      if(Map.layers[i].type === "objectgroup")
      {
        var len = Map.layers[i].objects.length;
        for(var j = 0; j < len; j++)
        {
          var mapObject = Map.layers[i].objects[j];

          // We will get coordinates from object top left coming
          // out of Tiled, but ige deals with object centers
          var xPos = mapObject.x + mapObject.width / 2;
          var yPos = mapObject.y + mapObject.height / 2;

          // Create the static objects in box2d
  				var obj = new IgeEntityBox2d()
  					.translateTo(xPos, yPos, 0)
  					.width(mapObject.width)
  					.height(mapObject.height)
  					.mount(self.scene)
  					.box2dBody(physicsProperties);

          obj.isStatic = true;
          self.objects.push(obj);
        }
      }
    }
  }

  return self;
}

if (typeof(module) !== "undefined" && typeof(module.exports) !== "undefined") {
  module.exports = Background;
}
