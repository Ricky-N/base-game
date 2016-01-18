console.log("Beginning Postprocess");
console.log("============================");

var fs = require("fs");
var data = JSON.parse(
  fs.readFileSync("assets/map/newMap.json")
);

// We may know something about an image from the Tiled data, which is
// destined to represent an entity with a static physics representation,
// or a MapObject in our game world. This helps us map from the tile now
// to that information later on when initializing the background.
var mapObjectInfo = {
  "../official/tree.png": { // keys are cell numbers in sheet
    1: {
      "x": 0, // offset of physics center relative to center of image
      "y": 60, // physics object is centered 60 pixels below image center
      "width": 30, // this is a half-width (thank box2d)
      "height": 32, // and half-height
    },
    2: {
      "x": 0,
      "y": 60,
      "width": 30,
      "height": 32,
    }
  }
}

// build out the object that will actually be used at game run time
MapObjects = {};
for(var i = 0; i < data.tilesets.length; i ++)
{
  if(mapObjectInfo.hasOwnProperty(data.tilesets[i].image))
  {
    var tileset = data.tilesets[i];
    for(var cell in mapObjectInfo[tileset.image])
    {
      if(mapObjectInfo[tileset.image].hasOwnProperty(cell))
      {
        var gidInfo = {
          "sheetData": {
            "location": tileset.image,
            // floor deals with margins and spacing for us nicely
            "columns": Math.floor(tileset.imagewidth / tileset.tilewidth),
            "rows": Math.floor(tileset.imageheight / tileset.tileheight),
            "cell": parseInt(cell)
          },
          "height": tileset.tileheight,
          "width": tileset.tilewidth
        }
        gidInfo.shapeData = mapObjectInfo[tileset.image][cell];

        MapObjects[tileset.firstgid + parseInt(cell) - 1] = gidInfo;
      }
    }
  }
}

data.tilephysics = MapObjects;

var jsOut = "var GameMap = " + JSON.stringify(data) +
";if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = GameMap; }";


fs.writeFileSync("assets/map/map.js", jsOut);

console.log("============================");
console.log("Postprocessing Finished")
