var igeClientConfig = {
	include: [
		"./gameClasses/SheetManager.js",
		"./gameClasses/ClientNetworkEvents.js",
		"./gameClasses/Background.js",
		"./gameClasses/StatusComponent.js",
		"./gameClasses/Projectile.js",
		"./gameClasses/DamageField.js",
		"./gameClasses/ScalingManager.js",
		"./gameClasses/Abilities.js",
		"./gameClasses/AbilityStep.js",
		"./gameClasses/AbilitySelection.js",
		"./gameClasses/Character.js",
		"./gameClasses/PlayerComponent.js",
		"./gameClasses/ControlPanel.js",
		"./gameClasses/MapObject.js",
		"./client.js",
		"./index.js"
	]
};

if (typeof(module) !== "undefined" && typeof(module.exports) !== "undefined")
{
	module.exports = igeClientConfig;
}
