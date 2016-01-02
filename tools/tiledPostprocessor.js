console.log("Beginning Postprocess");
console.log("============================");

var fs = require("fs");
var data = JSON.parse(
  fs.readFileSync("assets/map/newMap.json")
);

// // we have a problem with the tiled data where it
// // doesn't play very well with texture maps when
// // the tiles aren't all the same size.
// var len = data.tilesets.length;
// var lastTileset = data.tilesets[len - 1];
//
// // we will just remap gids for too big tilesets
// // instead of bothering with shifting, etc
// var maxgid = lastTileset.firstgid + lastTileset.tilecount  - 1;
//
// for(i = 0; i < data.tilesets.length; i++)
// {
//   var tileset = data.tilesets[i];
//   if(tileset.tilewidth > data.tilewidth)
//   {
//
//     console.log(data.tilesets[i].image);
//   }
// }

var jsOut = "var Map = " + JSON.stringify(data) +
";if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Map; }";


fs.writeFileSync("assets/map/map.js", jsOut);

console.log("============================");
console.log("Postprocessing Finished")
