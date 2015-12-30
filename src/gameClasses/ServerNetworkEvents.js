function ServerNetworkMessage(name, onMessage)
{
	this.name = name;
	this.onMessage = onMessage;
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

var playerConnect = new ServerNetworkMessage("connect", function(socket){
	// Don't reject the client connection, true would reject it
	return false;
});
ServerNetworkEvents.incoming.push(playerConnect);

var playerDisconnect = new ServerNetworkMessage("disconnect", function(clientId){
	if (ige.server.players[clientId]) {
		// Remove the player from the game
		ige.server.players[clientId].destroy();

		// Remove the reference to the player entity
		// so that we don't leak memory
		delete ige.server.players[clientId];
	}
});
ServerNetworkEvents.incoming.push(playerDisconnect);

var playerEntity = new ServerNetworkMessage("playerEntity", function(data, clientId){
	if (!ige.server.players[clientId]) {
		ige.server.players[clientId] = new Character(clientId);
		var controlMetadata = ige.server.players[clientId].abilitySet.getControlMetadata();
		ige.server.players[clientId].addComponent(PlayerComponent, controlMetadata);

		var returnData = {
			id: ige.server.players[clientId].id(),
			controlMetadata: controlMetadata
		};

		// Tell the client to track their player entity
		ige.network.send("playerEntity", returnData, clientId);
	}
});
ServerNetworkEvents.incoming.push(playerEntity);

var controlUpdate = new ServerNetworkMessage("controlUpdate", function(data, clientId){
	// TODO: switch
	var controls;
	if(data.type === "Press")
	{
		controls = ige.server.players[clientId].playerControl.pressControls;
		controls[data.control]._active = data.data;
	}
	else if(data.type === "Direction")
	{
		controls = ige.server.players[clientId].playerControl.directionControls;
		controls[data.control]._active = data.data;
	}
	else if(data.type === "ToggleClick")
	{
		// we don't want to clog up behaviour loops with an event that should be
		// relatively rare, so handle the event directly here async to ticks
		controls = ige.server.players[clientId].playerControl.toggleClickControls.controls;
		controls[data.control].ability.use(data.data);
	}
	else if(data.type === "Click")
	{
		ige.server.players[clientId].abilitySet.autoAttack.use(data.data);
	}
});
ServerNetworkEvents.incoming.push(controlUpdate);

var requestMap = new ServerNetworkMessage("requestMap", function(data, clientId, requestId){
	// Send the Map data back
	// TODO, have this loaded somehow other than through that js file
	// such as persistent db document
	ige.network.response(requestId, Map);
});
ServerNetworkEvents.incoming.push(requestMap);

var activate = new ServerNetworkMessage("activate", function(response){
	//console.log('This is a bunch of bullshit, client will never send this!!!');
});
ServerNetworkEvents.incoming.push(activate);

if (typeof(module) !== "undefined" && typeof(module.exports) !== "undefined")
{
	module.exports = ServerNetworkEvents;
}
