/**
 * A simple encapsulation of the name of a command
 * and the callback when it is received
 * @class
 */
function ClientNetworkMessage(name, onMessage)
{
	/** The command name that will trigger the callback */
	this.name = name;
	/** The callback for when the command is received */
	this.onMessage = onMessage;
	return this;
}

/**
 * All events the client may receve must come through this object, being
 * added to the listen property, calling listen after initializing the
 * network will begin handling those events.
 * @property {object} incoming the array of ClientNetworkMessage
 * @property {function} listen begin listening for messages
 */
var ClientNetworkEvents = {
	incoming: [],
	listen: function()
	{
		for(var i = 0; i < this.incoming.length; i++)
		{
			var listener = this.incoming[i];
			ige.network.define(listener.name, listener.onMessage);
		}
	}
};

function initPlayer(entityId, controlMetadata)
{
	var player = ige.$(entityId);
	player.addComponent(PlayerComponent, controlMetadata);
	ige.client.vp1.camera.trackTranslate(player, 50);
	ige.client.vp1.camera.lookAt(player, 0);
	ige.client.controlPanel.setAbilities(controlMetadata);
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

var activate = new ClientNetworkMessage("activate", function(response) {
	ige.$(response).activate();
});
ClientNetworkEvents.incoming.push(activate);

var activate = new ClientNetworkMessage("cooldown", function(response) {
	ige.client.controlPanel.triggerCooldown(response);
});
ClientNetworkEvents.incoming.push(activate);

if (typeof(module) !== "undefined" && typeof(module.exports) !== "undefined")
{
	module.exports = ClientNetworkEvents;
}
