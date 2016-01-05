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

var playerConnect = new ServerNetworkMessage("connect", function(socket) {
	// Don't reject the client connection, true would reject it
	return false;
});
ServerNetworkEvents.incoming.push(playerConnect);

var playerDisconnect = new ServerNetworkMessage("disconnect", function(clientId) {
	// TODO: this doesn't seem to be working
	if (ige.server.players[clientId]) {
		// Remove the player from the game
		ige.server.players[clientId].destroy();

		// Remove the reference to the player entity
		// so that we don't leak memory
		delete ige.server.players[clientId];
	}
});
ServerNetworkEvents.incoming.push(playerDisconnect);

var playerEntity = new ServerNetworkMessage("playerEntity", function(data, clientId) {
	if (!ige.server.players[clientId]) {
		data.clientId = clientId;
		ige.server.players[clientId] = new Character(data);
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

var buttonToAbility =
{
	0: 0, // left click -> ability 1
	2: 1, // right click -> ability 2
	3: 2, // shift + left -> ability 3
	5: 3	// shift + right -> ability 4
};

var controlUpdate = new ServerNetworkMessage("controlUpdate", function(data, clientId) {
	var controls;
	// if(data.type === "Press")
	// {
	// 	controls = ige.server.players[clientId].playerControl.pressControls;
	// 	controls[data.control]._active = data.data;
	// }
	/*else*/ if(data.type === "Direction")
	{
		controls = ige.server.players[clientId].playerControl.directionControls;
		controls[data.control]._active = data.data;
	}
	// else if(data.type === "ToggleClick")
	// {
	// 	// we don't want to clog up behaviour loops with an event that should be
	// 	// relatively rare, so handle the event directly here async to ticks
	// 	controls = ige.server.players[clientId].playerControl.toggleClickControls.controls;
	// 	var ability = controls[data.control].ability;
	// 	var cooldown = ability.use(data.data);
	// 	ige.network.send("cooldown", { name: ability.name, cooldown: cooldown });
	// }
	else if(data.type === "Click")
	{
		if(buttonToAbility.hasOwnProperty(data.data.button))
		{
			var abilityIndex = buttonToAbility[data.data.button];
			ability = ige.server.players[clientId].abilitySet.abilities[abilityIndex];
			if(ability)
			{
				var cooldown = ability.use(data.data);
				ige.network.send("cooldown", {
					index: abilityIndex,
					cooldown: cooldown
				});
			}
		}
	}
});
ServerNetworkEvents.incoming.push(controlUpdate);

var requestMap = new ServerNetworkMessage("requestMap", function(data, clientId, requestId) {

	// TODO: this should live on it's own server, almost like a CDN, but specifically
	// to make sure we serve up static entities without fucking every other player
	for(var i = 0; i < ige.server.background.entities.length; i++)
	{
		ige.server.background.entities[i].streamSync([clientId]);
	}

	// Send the Map data back
	// TODO, have this loaded somehow other than through that js file
	// such as persistent db document
	ige.network.response(requestId, Map);
});
ServerNetworkEvents.incoming.push(requestMap);


// ======================================================================
// ======================================================================
// for some reason this net io module expects all events the client will
// ever receive to have a server side mirror. We must create them, but
// they will just live in this zombie section where stupid features live.
// ======================================================================
var activate = new ServerNetworkMessage("activate", function(response){
	//console.log('This is a bunch of bullshit, client will never send this!!!');
});
ServerNetworkEvents.incoming.push(activate);
var activate = new ServerNetworkMessage("cooldown", function(response){
	//console.log('This is a bunch of bullshit, client will never send this!!!');
});
ServerNetworkEvents.incoming.push(activate);
// ======================================================================
// ======================================================================

if (typeof(module) !== "undefined" && typeof(module.exports) !== "undefined")
{
	module.exports = ServerNetworkEvents;
}
