function ClientNetworkMessage(name, onMessage)
{
	this.name = name;
	this.onMessage = onMessage;
	return this;
}

var ClientNetworkEvents = {
	listen: function() {
		for(var i = 0; i < this.incoming.length; i++){
			var listener = this.incoming[i];
			ige.network.define(listener.name, listener.onMessage);
		}
	},

	incoming: []
};

function initPlayer(entityId, controlMetadata)
{
	// Add the player control component and track with camera
	var player = ige.$(entityId);
	player.addComponent(PlayerComponent, controlMetadata);
	// have the camera follow the player
	ige.client.vp1.camera.trackTranslate(player, 50);
	// but start out viewing them
	ige.client.vp1.camera.lookAt(player, 0);
	ige.client.controlPanel.trackStatus(player);
}

var player = new ClientNetworkMessage("playerEntity", function(response) {
	// if the entity already exists, just deal with it, otherwise listen for
	// any newly created entities being streamed in
	var entityId = response.id;
	if (ige.$(entityId))
	{
		initPlayer(entityId, response.controlMetadata);
	}
	else
	{
		var self = this;
		self._eventListener = ige.network.stream.on("entityCreated", function (entity) {
			// if the right entity was just received, turn off the listener
			if (entity.id() === entityId)
			{
				initPlayer(entityId, response.controlMetadata);
				ige.network.stream.off("entityCreated", self._eventListener);
			}
		});
	}
});
// not exactly sure why this is required, but new inside the push fails :/
ClientNetworkEvents.incoming.push(player);

if (typeof(module) !== "undefined" && typeof(module.exports) !== "undefined")
{
	module.exports = ClientNetworkEvents;
}
