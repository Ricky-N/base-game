var config = {
	// order is absurdly important here, this is one big failing of
	// IGE and its custom module system in that it can become very very hard
	// to understand where a class in a specific file came from :/
	include: [
		{name: "Vector2d", path: "./gameClasses/Vector2d"},
		{name: "Math2d", path: "./gameClasses/Math2d"},
		{name: "Map", path: "../assets/map/map"},
		{name: "Background", path: "./gameClasses/Background"},
		{name: "ServerNetworkEvents", path: "./gameClasses/ServerNetworkEvents"},
		{name: "StatusComponent", path: "./gameClasses/StatusComponent"},
		{name: "Character", path: "./gameClasses/Character"},
		{name: "PlayerComponent", path: "./gameClasses/PlayerComponent"}
	]
};

if (typeof(module) !== "undefined" && typeof(module.exports) !== "undefined")
{
	module.exports = config;
}
