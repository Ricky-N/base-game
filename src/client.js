function Client()
{
	this.classId = "Client";

	this.init = function() {

		var self = this;
		ige.globalSmoothing(true);
		ige.addComponent(IgeNetIoComponent);
		ige.createFrontBuffer(true);
		ige.sheetManager = new SheetManager();

		this.characters = [];
		this.renderLatency = 100;

		// we don't do any pre-loading of textures right now, it
		// may be a good idea to base load some in case perf in
		// the first few seconds of gameplay starts feeling slow
		ige.start(function (success) {

			if (success)
			{
				// TODO: right now build process will replace this with test server
				// location if handed the --test flag, but we should template it better
				ige.network.start("http://localhost:2000", function () {

					ClientNetworkEvents.listen();

					ige.network.addComponent(IgeStreamComponent)
						.stream.renderLatency(self.renderLatency)
						.stream.on("entityCreated", function (entity) {

							if(entity.classId() === "Character")
							{
								self.characters.push(entity);
							}
							//self.log("Stream entity created with ID: " + entity.id());
						});

					self.mainScene = new IgeScene2d().id("mainScene");

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

					// Grab desired abilities from querystring
					// TODO: replace this hack with real ui for picking!
					function getParameterByName(name) {
				    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
				    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
				        results = regex.exec(location.search);
				    return results === null ? "" :
							decodeURIComponent(results[1].replace(/\+/g, " "));
					}

					opts = { abilities: getParameterByName("abilities").split(",") };
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
