var Client = IgeClass.extend({
	classId: 'Client',

	init: function () {
		//ige.timeScale(0.1);
		ige.showStats(1);
		ige.globalSmoothing(true);

		var self = this;

		// Enable networking
		ige.addComponent(IgeNetIoComponent);
		// Implement our game methods
		//this.implement(ClientNetworkEvents);
		// Create the HTML canvas
		ige.createFrontBuffer(true);

		// Load the textures we want to use
		this.textures = {
			grassSheet: new IgeCellSheet('./textures/tiles/tilea2.png', 16, 12)
		};

		ige.on('texturesLoaded', function () {
			// Ask the engine to start
			ige.start(function (success) {
				// Check if the engine started successfully
				if (success) {
					// Start the networking (you can do this elsewhere if it
					// makes sense to connect to the server later on rather
					// than before the scene etc are created... maybe you want
					// a splash screen or a menu first? Then connect after you've
					// got a username or something?
					ige.network.start('http://localhost:2000', function () {
						// Setup the network command listeners
						ClientNetworkEvents.listen();

						// Setup the network stream handler
						ige.network.addComponent(IgeStreamComponent)
							.stream.renderLatency(80) // Render the simulation 160 milliseconds in the past
							// Create a listener that will fire whenever an entity
							// is created because of the incoming stream data
							.stream.on('entityCreated', function (entity) {
								self.log('Stream entity created with ID: ' + entity.id());
							});

						self.mainScene = new IgeScene2d()
							.id('mainScene');

						self.backgroundScene = new IgeScene2d()
							.id('backgroundScene')
							.layer(0)
							.mount(self.mainScene);

						self.foregroundScene = new IgeScene2d()
							.id('foregroundScene')
							.layer(1)
							.mount(self.mainScene);

						self.uiScene = new IgeScene2d()
							.id('uiScene')
							.layer(2)
							.ignoreCamera(true)
							.mount(self.mainScene);

						ige.ui.style('.controlPanel', {
							'width': '80%',
							'height': '7%',
							'bottom': '3%',
							'right': '10%'
						});

						ige.ui.style('.healthBar', {
							'width': '80%',
							'height': '45%',
							'borderColor': 'black',
							'boderWidth': 3,
							'backgroundColor': 'green',
							'top': '0%',
							'left': '0%'
						});

						ige.ui.style('.powerBar', {
							'width': '80%',
							'height': '45%',
							'borderColor': 'black',
							'boderWidth': 3,
							'backgroundColor': 'blue',
							'top': '55%%',
							'left': '0%'
						});

						ige.ui.style('.button', {
							'width': '15%',
							'height': '90%',
							'borderColor': 'black',
							'borderWidth': 3,
							'backgroundColor': 'brown',
							'right': '0%',
							'top': '5%'
						});

						ige.ui.style('.button:hover', {
							'backgroundColor': 'red'
						});

						self.controlPanel = new IgeUiElement()
							.id('controlPanel')
							.styleClass('controlPanel')
							.mount(self.uiScene);

						new IgeUiElement()
							.id('healthBar')
							.styleClass('healthBar')
							.allowFocus(false)
							.mount(self.controlPanel);

						new IgeUiElement()
						 	.id('powerBar')
							.styleClass('powerBar')
							.allowFocus(false)
							.mount(self.controlPanel);

						new IgeUiElement()
							.id('button')
							.styleClass('button')
							.mount(self.controlPanel);

						// Create the main viewport and set the scene
						// it will "look" at as the new scene1 we just
						// created above
						self.vp1 = new IgeViewport()
							.id('vp1')
							.autoSize(true)
							.scene(self.mainScene)
							.drawBounds(false)
							.mount(ige);

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
												.mount(self.backgroundScene);
									 }
								 });
						});

						// Ask the server to create an entity for us
						ige.network.send('playerEntity');

						// We don't create any entities here because in this example the entities
						// are created server-side and then streamed to the clients. If an entity
						// is streamed to a client and the client doesn't have the entity in
						// memory, the entity is automatically created. Woohoo!
					});
				}
			});
		});
	}
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Client; }
