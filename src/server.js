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

		// Add physics and setup physics world
		ige.addComponent(IgeBox2dComponent);
		ige.box2d.scaleRatio(32);
		ige.box2d.sleep(true)
			//.box2d.gravity(0, 10)
			.box2d.createWorld()
			.box2d.start();

		ige.box2d.contactListener(
			// Listen for when contact's begin
			function (contact) {
				console.log('Contact begins between', contact.igeEntityA()._id, 'and', contact.igeEntityB()._id);
				console.log('A_x: ' + contact.igeEntityA()._translate.x);
				console.log('A_y: ' + contact.igeEntityA()._translate.y);
				console.log('B_x: ' + contact.igeEntityB()._translate.x);
				console.log('B_y: ' + contact.igeEntityB()._translate.y);
			},
			// Listen for when contact's end
			function (contact) {
				console.log('Contact ends between', contact.igeEntityA()._id, 'and', contact.igeEntityB()._id);
			},
			// Handle pre-solver events
			function (contact) {
			// For fun, lets allow ball1 and square2 to pass through each other
			// if (contact.igeEitherId('ball1') && contact.igeEitherId('square2')) {
			// 	// Cancel the contact
			// 	contact.SetEnabled(false);
			// }

			// You can also check an entity by it's category using igeEitherCategory('categoryName')
			}
		)

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
					self.background = new Background(self.mainScene);

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
