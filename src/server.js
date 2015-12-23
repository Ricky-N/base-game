function Server()
{
	this.classId = 'Server';
	this.Server = true;
	this.port = 2000;

	this.init = function (options)
	{
		var self = this;
		ige.timeScale(1);

		// TODO: we need a real set of gameworld objects to manage
		this.players = {};

		ige.addComponent(IgeNetIoComponent)
		// Because of the way inheritance is handled here, moving
		// this anonymous function out is insanely hard. Good Luck :)
		ige.network.start(this.port, function (){
			// Networking has started so start the game engine
			ige.start(function(success){
				// Check if the engine started successfully
				if (success) {
					// begin listening to incoming network events
					ServerNetworkEvents.listen();

					ige.network.addComponent(IgeStreamComponent)
						 .stream.sendInterval(30)
						 .stream.start();

					ige.network.acceptConnections(true);

					self.mainScene = new IgeScene2d().id('mainScene');

					// TODO: extend Background for server so that we can
					// use it for collision info with things like mountains
					self.backgroundScene = new IgeScene2d()
						.id('backgroundScene')
						.mount(self.mainScene);

					self.foregroundScene = new IgeScene2d()
						.id('foregroundScene')
						.mount(self.mainScene);

					// Create the main viewport and set the scene
					// it will "look" at as the new scene1 we just
					// created above
					self.vp1 = new IgeViewport()
						.id('vp1')
						.autoSize(true)
						.scene(self.mainScene)
						.drawBounds(true)
						.mount(ige);
				}
			});
		});
	}
}

var Server = IgeClass.extend(new Server());
if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined')
{
	module.exports = Server;
}
