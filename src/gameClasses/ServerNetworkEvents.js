function ServerNetworkMessage(name, onMessage)
{
	this.name = name
	this.onMessage = onMessage
	return this;
}

var ServerNetworkEvents = {
	listen: function() {
		for(var i = 0; i < this.incoming.length; i++){
			var listener = this.incoming[i];
			ige.network.define(listener.name, listener.onMessage);
		}
	},

	incoming: []
};

var playerConnect = new ServerNetworkMessage('connect', function(socket){
	// Don't reject the client connection, true would reject it
	return false;
});
ServerNetworkEvents.incoming.push(playerConnect);

var playerDisconnect = new ServerNetworkMessage('disconnect', function(clientId){
	if (ige.server.players[clientId]) {
		// Remove the player from the game
		ige.server.players[clientId].destroy();

		// Remove the reference to the player entity
		// so that we don't leak memory
		delete ige.server.players[clientId];
	}
});
ServerNetworkEvents.incoming.push(playerDisconnect);

var playerEntity = new ServerNetworkMessage('playerEntity', function(data, clientId){
	if (!ige.server.players[clientId]) {
		ige.server.players[clientId] = new Character(clientId)
			.addComponent(PlayerComponent)
			.streamMode(1)
			.mount(ige.server.foregroundScene);

		// Tell the client to track their player entity
		ige.network.send('playerEntity', ige.server.players[clientId].id(), clientId);
	}
});
ServerNetworkEvents.incoming.push(playerEntity);

var controlUpdate = new ServerNetworkMessage('controlUpdate', function(data, clientId){
	var controls = ige.server.players[clientId].playerControl.controls;
	controls[data.direction]._active = data.setting;
})
ServerNetworkEvents.incoming.push(controlUpdate);

var requestMap = new ServerNetworkMessage('requestMap', function(data, clientId, requestId){
	// Send the Map data back
	// TODO, have this loaded somehow other than through that js file
	// such as persistent db document
	ige.network.response(requestId, Map);
})
ServerNetworkEvents.incoming.push(requestMap);

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = ServerNetworkEvents; }
