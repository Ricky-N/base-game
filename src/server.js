function Server()
{
	this.classId = "Server";
	this.Server = true;
	this.port = 2000;

	this.init = function (options)
	{
		var self = this;
		ige.timeScale(1);
		this.players = {};

		ige.addComponent(IgeNetIoComponent);

		// Add physics and setup physics world
		ige.addComponent(IgeBox2dComponent);
		ige.box2d.scaleRatio(32);
		ige.box2d.sleep(true)
			//.box2d.gravity(0, 10)
			.box2d.createWorld()
			.box2d.start();


		// TODO: Move into its own module along with other physics info like
		// global physics parameters, and the init stuff above
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
			// contact begins listener
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
			// contact ends listener
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

		ige.network.start(this.port, function (){

			ige.start(function(success){

				if (success)
				{
					ServerNetworkEvents.listen();
					ige.network.addComponent(IgeStreamComponent)
						 .stream.sendInterval(50)
						 .stream.start();
					ige.network.acceptConnections(true);

					self.mainScene = new IgeScene2d().id("mainScene");

					self.foregroundScene = new IgeScene2d()
						.id("foregroundScene")
						.mount(self.mainScene);

					self.background = new Background(self.mainScene);
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
