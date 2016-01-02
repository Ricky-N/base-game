var igeClientConfig = {
	include: [
		/* Your custom game JS scripts */
		"./gameClasses/SheetManager.js",
		"./gameClasses/ClientNetworkEvents.js",
		"./gameClasses/StatusComponent.js",
		"./gameClasses/Projectile.js",
		"./gameClasses/DamageField.js",
		"./gameClasses/AbilityComponent.js",
		"./gameClasses/Character.js",
		"./gameClasses/PlayerComponent.js",
		"./gameClasses/ControlPanel.js",
		"./gameClasses/MapObject.js",
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
