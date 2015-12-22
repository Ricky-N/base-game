function ClientNetworkMessage(name, onMessage)
{
	this.name = name
	this.onMessage = onMessage
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

function initPlayer(entityId)
{
	// Add the player control component and track with camera
	ige.$(entityId).addComponent(PlayerComponent);
	ige.client.vp1.camera.trackTranslate(ige.$(entityId), 50);
}

var player = new ClientNetworkMessage('playerEntity', function(entityId) {
	// if the entity already exists, just deal with it, otherwise listen for
	// any newly created entities being streamed in
	if (ige.$(entityId))
	{
		initPlayer(entityId);
	}
	else
	{
		var self = this;
		self._eventListener = ige.network.stream.on('entityCreated', function (entity) {
			// if the right entity was just received, turn off the listener
			if (entity.id() === entityId)
			{
				initPlayer(entityId);
				ige.network.stream.off('entityCreated', self._eventListener);
			}
		});
	}
});
// not exactly sure why this is required, but new inside the push fails :/
ClientNetworkEvents.incoming.push(player);

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = ClientNetworkEvents; }
