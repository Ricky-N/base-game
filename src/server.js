function Server()
{
	this.classId = "Server";
	this.Server = true;
	this.port = 2000;

	this.init = function (options)
	{
		var self = this;
		ige.timeScale(1);

		// TODO: we need a real set of gameworld objects to manage
		this.players = {};

		ige.addComponent(IgeNetIoComponent);

		// Add physics and setup physics world
		ige.addComponent(IgeBox2dComponent);
		ige.box2d.scaleRatio(32);
		ige.box2d.sleep(true)
			//.box2d.gravity(0, 10)
			.box2d.createWorld()
			.box2d.start();


		// TODO: this doesn't feel like the right place for this anymore..
		function handleProjectileCollision(entityA, classA, entityB, classB)
		{
			if(classA === "Projectile")
			{
				entityA.lifeSpan(75);
				if(classB === "Character")
				{
					entityB.status.health(entityB.status.health() - entityA.damage);
				}
			}
		}

		self.tryHandleProjectileCollision = function(entityA, entityB)
		{
			var classA = entityA.classId();
			var classB = entityB.classId();

			handleProjectileCollision(entityA, classA, entityB, classB);
			handleProjectileCollision(entityB, classB, entityA, classA);
		};

		ige.box2d.contactListener(
			// Listen for when contact begin
			function (contact)
			{
				if(contact.igeEntityA().classId() === "DamageField" &&
					 contact.igeEntityB().classId() === "Character")
				{
					contact.igeEntityA().characterEnteredRange(
						contact.igeEntityB()._id
					);
				}

				if(contact.igeEntityB().classId() === "DamageField" &&
					 contact.igeEntityA().classId() === "Character")
				{
					contact.igeEntityB().characterEnteredRange(
						contact.igeEntityA()._id
					);
				}

				// checks if projectile collision occurred, if so it does stuff :)
				self.tryHandleProjectileCollision(
					contact.igeEntityA(),
					contact.igeEntityB()
				);
			},
			// Listen for when contact end
			function (contact)
			{
				if(contact.igeEntityA().classId() === "DamageField" &&
					 contact.igeEntityB().classId() === "Character")
				{
					contact.igeEntityA().characterLeftRange(
						contact.igeEntityB()._id
					);
				}

				if(contact.igeEntityB().classId() === "DamageField" &&
					 contact.igeEntityA().classId() === "Character")
				{
					contact.igeEntityB().characterLeftRange(
						contact.igeEntityA()._id
					);
				}
			},
			// Handle pre-solver events
			function (contact) {
			// For fun, lets allow ball1 and square2 to pass through each other
			// if (contact.igeEitherId("ball1") && contact.igeEitherId("square2")) {
			// 	// Cancel the contact
			// 	contact.SetEnabled(false);
			// }

			// You can also check an entity by it's category using
			// igeEitherCategory("categoryName")
			}
		);

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
						 .stream.sendInterval(50)
						 .stream.start();
					ige.network.acceptConnections(true);

					self.mainScene = new IgeScene2d().id("mainScene");

					// TODO: extend Background for server so that we can
					// use it for collision info with things like mountains
					self.background = new Background(self.mainScene);

					self.foregroundScene = new IgeScene2d()
						.id("foregroundScene")
						.mount(self.mainScene);

					// Create the main viewport and set the scene
					// it will "look" at as the new scene1 we just
					// created above
					self.vp1 = new IgeViewport()
						.id("vp1")
						.autoSize(true)
						.scene(self.mainScene)
						.drawBounds(true)
						.mount(ige);
				}
			});
		});
	};
}

var Server = IgeClass.extend(new Server());
if (typeof(module) !== "undefined" && typeof(module.exports) !== "undefined")
{
	module.exports = Server;
}
