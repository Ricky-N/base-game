var igeClientConfig = {
	include: [
		/* Your custom game JS scripts */
		"./gameClasses/ClientNetworkEvents.js",
		"./gameClasses/StatusComponent.js",
		"./gameClasses/AbilityComponent.js",
		"./gameClasses/Character.js",
		"./gameClasses/PlayerComponent.js",
		"./gameClasses/ControlPanel.js",
		"./gameClasses/Background.js",

		/* Standard game scripts */
		"./client.js",
		"./index.js"
	]
};

if (typeof(module) !== "undefined" && typeof(module.exports) !== "undefined")
{
	module.exports = igeClientConfig;
}
