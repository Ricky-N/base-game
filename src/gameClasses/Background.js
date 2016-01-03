function Background(mainScene){

  // TODO: Move this somewhere not here lol
  // Array Remove - By John Resig (MIT Licensed)
  Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
  };

  var self = this;
  this.scene = new IgeScene2d()
    .id("backgroundScene")
    .layer(0)
    .mount(mainScene);

  this._physicsProperties = {
    type: "static",
    allowSleep: true,
    fixtures: [{
      shape: {
        type: "rectangle"
      }
    }]
  };

  // things that aren't this size won't render
  // the way we want them to on the client, they
  // had better become entities on the server
  this.tilewidth = 64;

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
            layers[i].tileWidth(self.tilewidth)
              .tileHeight(self.tilewidth)
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
    // We have a couple of goals here:
    // 1. Things that need to be depth sorted (trees) need to be
    //    turned into entities. They will get streamed to the Client
    //    so we need to remove them from map data
    // 2. Things that aren't the same resolution as everything else
    //    get really screwed up on render, so error if we would send
    //    tiles for background that aren't this.tilewidth
    this.objects = [];
    this.entities = [];
    layersToRemove = [];
    var j;
    for(var i = 0; i < Map.layers.length; i++)
    {
      // if it is an object layer it is purely something we
      // should turn into static physics objects
      if(Map.layers[i].type === "objectgroup")
      {
        layersToRemove.push(i);
        var len = Map.layers[i].objects.length;
        for(j = 0; j < len; j++)
        {
          var mapObject = Map.layers[i].objects[j];

          // We will get coordinates from object top left coming
          // out of Tiled, but ige deals with object centers
          var xPos = mapObject.x + mapObject.width / 2;
          var yPos = mapObject.y + mapObject.height / 2;

          // Create the static objects in box2d
  				var obj = new IgeEntityBox2d()
            .streamMode(0) // don't stream these down, purely physics
  					.translateTo(xPos, yPos, 0)
  					.width(mapObject.width)
  					.height(mapObject.height)
  					.mount(this.scene)
  					.box2dBody(this._physicsProperties);

          obj.isStatic = true;
          this.objects.push(obj);
        }
      }
      else
      {
        // TODO: generate this in our postprocess of the json file.
        var objectMapping = {
          21: {
            "sheetData":{
              "location": "./official/tree.png",
              "columns": 2,
              "rows": 1,
              "cell": 1
            },
            "height": 192,
            "width": 128,
            "shapeData": {
              "x": 0,
              "y": 60,
              "width": 30,
              "height": 32,
            }
          },
          22: {
            "sheetData":{
              "location": "./official/tree.png",
              "columns": 2,
              "rows": 1,
              "cell": 2
            },
            "height": 192,
            "width": 128,
            "shapeData": {
              "x": 0,
              "y": 60,
              "width": 30,
              "height": 32,
            }
          }
        };

        // for now we assume ground is always a client texture, they need
        // to display something! but everything else is fair game to remove
        if(Map.layers[i].name !== "BaseLayer")
        {
          var data = Map.layers[i].data;
          for(j = 0; j < data.length; j++)
          {
            var mapping = objectMapping[data[j]];
            if(typeof mapping !== "undefined")
            {
              // position is tricky here as the Tiled information will come
              // in tiles, but the image placement for images larger than a
              // single tile width is such that the image grows up and right
              // from the tile it was placed on. This is wrong for the y!
              var bottomTileBottom = Math.floor(j / Map.width) * Map.tileheight + Map.tileheight;

              // doing this without cloning isn't the greatest
              // thing to do, but we want efficiency damn it!
              mapping.position = {
                "x": (j % Map.width) * Map.tilewidth + 0.5 * mapping.width,
                "y": bottomTileBottom - (0.5 * mapping.height)
              };

              this.entities.push(new MapObject(mapping));
              // make sure we remove it from the map
              data[j] = 0;
            }
          }
          // if the object is in our object mapping

          // create a new map object entity
          // remove from the layer

          // if the layer is empty after this, mark it for trimming
          var empty = true;
          for(j = 0; j < data.length; j++)
          {
            if(data[j] !== 0)
            {
              empty = false;
              break;
            }
          }
          if(empty)
          {
            layersToRemove.push(i);
          }
        }
      }
    }

    // peel off the layers that shouldn't be sent to client
    for(i = 0; i < layersToRemove.length; i++)
    {
      Map.layers.remove(layersToRemove[i]);
    }
  }

  return self;
}

if (typeof(module) !== "undefined" && typeof(module.exports) !== "undefined") {
  module.exports = Background;
}
