function Background(mainScene){
  var self = this;
  self.scene = new IgeScene2d()
    .id('backgroundScene')
    .layer(0)
    .mount(mainScene);

  ige.network.request('requestMap', {}, function(commandName, data){
    ige.addComponent(IgeTiledComponent)
       .tiled.loadJson(data, function(layers, layersById) {
         for(var i = 0; i < layers.length; i++)
         {
           layers[i].tileWidth(32)
              .tileHeight(32)
              .autoSection(20)
              .drawBounds(false)
              .drawBoundsData(false)
              .drawMouse(true)
              .mount(self.scene);
         }
       });
  });

  return self;
}

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') {
  module.exports = Background;
}
