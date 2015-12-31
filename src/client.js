function Client()
{
	this.classId = "Client";

	this.init = function() {
		var self = this;

		//ige.addComponent(IgeEditorComponent);
		ige.globalSmoothing(true);

		ige.addComponent(IgeNetIoComponent);
		ige.createFrontBuffer(true);

		// TODO better object here!
		this.players = [];

		// we don't do any pre-loading of textures right now, it
		// may be a good idea to base load some in case perf in
		// the first few seconds of gameplay start feeling slow
		ige.start(function (success) {
			// Check if the engine started successfully
			if (success) {
				// Start the networking (you can do this elsewhere if it
				// makes sense to connect to the server later on rather
				// than before the scene etc are created... maybe you want
				// a splash screen or a menu first? Then connect after you"ve
				// got a username or something?
				// TODO: right now build process will replace this with test server
				// location if handed the --test flag, but we should template it better
				ige.network.start("http://localhost:2000", function () {

					// Setup the network command listeners
					ClientNetworkEvents.listen();

					// Setup the network stream handler, log when we get new things
					ige.network.addComponent(IgeStreamComponent)
						.stream.renderLatency(100)
						.stream.on("entityCreated", function (entity) {
							self.players.push(entity);
							self.log("Stream entity created with ID: " + entity.id());
						});

					self.mainScene = new IgeScene2d().id("mainScene")
							.mouseDown(function(){
								console.log(ige._currentViewport.mousePos());
							});
					self.background = new Background(self.mainScene);
					self.controlPanel = new ControlPanel(self.mainScene);
					self.foregroundScene = new IgeScene2d()
						.id("foregroundScene")
						.layer(1)
						.mount(self.mainScene);

					self.vp1 = new IgeViewport()
						.id("vp1")
						.autoSize(true)
						.scene(self.mainScene)
						.drawBounds(false)
						.mount(ige);

					// TODO: replace this hack with real ui for picking!
					function getParameterByName(name) {
				    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
				    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
				        results = regex.exec(location.search);
				    return results === null ? "" :
							decodeURIComponent(results[1].replace(/\+/g, " "));
					}

					opts = { abilities: getParameterByName("abilities").split(",") };

					// Ask the server to create an entity for us
					ige.network.send("playerEntity", opts);
				});
			}
		});
	};

	return this;
}

var Client = IgeClass.extend(new Client());
if (typeof(module) !== "undefined" && typeof(module.exports) !== "undefined")
{
	module.exports = Client;
}
