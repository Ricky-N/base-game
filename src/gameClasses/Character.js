function Character()
{
	this.classId = "Character",

	this.init = function (createData)
	{
		var self = this;
		IgeEntityBox2d.prototype.init.call(this);

		this.addComponent(StatusComponent);
		this.status.on("death", function(){
			// TODO: show death animation
			console.log("Character with id " + this.id + " has died!");
		});

		// we want to have some entities perfectly follow
		// this one, so we have to remap the translate
		this._translateToProtoChar = this.translateTo;
		this.translateTo = this._translateToChar;
		this.followingChildren = [];

		// for now lets start everyone a little into the map
		this.translate().x(300);
		this.translate().y(1885);

		if (ige.isServer)
		{
			this.height(48);
			this.width(32);
			this._speed = 0.18;

			this.addComponent(AbilityComponent, createData);
			this.abilitySheetInfo = this.abilitySet.getCellSheetInfo();

			this.box2dBody(this._physicsSettings);
			this.addComponent(IgeVelocityComponent);

			this.skin(Math.floor(Math.random() * 7));

			this.mount(ige.server.foregroundScene);
			this.streamMode(1);
		}
		else // ige.isClient
		{
			this.addComponent(IgeAnimationComponent).depth(1);

			ige.sheetManager.registerCallback(
				"./textures/sprites/vx_chara02_c.png", function(texture){
					self.texture(texture).dimensionsFromCell();
					// load the rest of the pertinent character information
					self.streamCreateData(createData);
					for(var i = 0; i < self.abilitySheetInfo.length; i++)
					{
						var info = self.abilitySheetInfo[i];
						ige.sheetManager.loadSheet(info.sheet, info.columns, info.rows);
					}
				}, 12, 8);
		}

		this.streamSections(["transform", "status"]);
		this._lastTranslate = this._translate.clone();
	};

	this._translateToChar = function (x, y, z) {
		this._translateToProtoChar(x, y, z);

		// if we have any following children, move them as well
		if (this.followingChildren.length) {
			var translate = this._translate;
			for(var i = 0; i < this.followingChildren.length; i++)
			{
				this.followingChildren[i].translateTo(
					translate.x, translate.y, translate.z
				);
			}
		}

		return this;
	};

	this._physicsSettings = {
		type: "dynamic",
		linearDamping: 2,
		angularDamping: 0.1,
		allowSleep:true,
		bullet: false,
		fixedRotation: true,
		gravitic: true,
		fixtures: [{
			density: 1.0, friction: 0.5, restitution: 0.0,
			shape: {
				type: "rectangle"
			}
		}]
	};

	// set should only be called from client,
	// get should only be called from server,
	// set basically undoes get to apply it locally
	this._characterStreamData = function(data)
	{
		if(typeof data !== "undefined")
		{
			this.status.health(data.health);
			this.status.power(data.power);
		}
		else
		{
			return {
				"health": this.status.health(),
				"power": this.status.power()
			};
		}
	};

	this.streamCreateData = function(data)
	{
		if(typeof data !== "undefined")
		{
			data = JSON.parse(data);
			this.skin(data.skin);
			this._characterStreamData(data);
			this.abilitySheetInfo = data.abilitySheetInfo;
		}
		else
		{
			data = this._characterStreamData();
			data.skin = this.skin();
			data.abilitySheetInfo = this.abilitySheetInfo;

			return JSON.stringify(data);
		}
	};

	this.streamSectionData = function(sectionId, data)
	{
		if(sectionId === "status")
		{
			// if provided data, it came from server so update
			if(data)
			{
				data = JSON.parse(data);
				this._characterStreamData(data);
			}
			else // otherwise it is asking for the update
			{
				return JSON.stringify(this._characterStreamData());
			}
		}
		else
    {
      return IgeEntityBox2d.prototype.streamSectionData.call(this, sectionId, data);
    }
	};

	// Sets the type of character which determines the character's
 	// animation sequences and appearance.
	this.skin = function (skin)
	{
		if(typeof skin === "undefined")
		{
			return this._skin;
		}
		else
		{
			this._skin = skin;

			if(ige.isClient)
			{
				// TODO: move this into metadata along with the assets
				switch (skin) {
					case 0:
						this.animation.define("walkDown", [1, 2, 3, 2], 8, -1)
							.animation.define("walkLeft", [13, 14, 15, 14], 8, -1)
							.animation.define("walkRight", [25, 26, 27, 26], 8, -1)
							.animation.define("walkUp", [37, 38, 39, 38], 8, -1)
							.cell(1);

						this._restCell = 1;
						break;

					case 1:
						this.animation.define("walkDown", [4, 5, 6, 5], 8, -1)
							.animation.define("walkLeft", [16, 17, 18, 17], 8, -1)
							.animation.define("walkRight", [28, 29, 30, 29], 8, -1)
							.animation.define("walkUp", [40, 41, 42, 41], 8, -1)
							.cell(4);

						this._restCell = 4;
						break;

					case 2:
						this.animation.define("walkDown", [7, 8, 9, 8], 8, -1)
							.animation.define("walkLeft", [19, 20, 21, 20], 8, -1)
							.animation.define("walkRight", [31, 32, 33, 32], 8, -1)
							.animation.define("walkUp", [43, 44, 45, 44], 8, -1)
							.cell(7);

						this._restCell = 7;
						break;

					case 3:
						this.animation.define("walkDown", [10, 11, 12, 11], 8, -1)
							.animation.define("walkLeft", [22, 23, 24, 23], 8, -1)
							.animation.define("walkRight", [34, 35, 36, 35], 8, -1)
							.animation.define("walkUp", [46, 47, 48, 47], 8, -1)
							.cell(10);

						this._restCell = 10;
						break;

					case 4:
						this.animation.define("walkDown", [49, 50, 51, 50], 8, -1)
							.animation.define("walkLeft", [61, 62, 63, 62], 8, -1)
							.animation.define("walkRight", [73, 74, 75, 74], 8, -1)
							.animation.define("walkUp", [85, 86, 87, 86], 8, -1)
							.cell(49);

						this._restCell = 49;
						break;

					case 5:
						this.animation.define("walkDown", [52, 53, 54, 53], 8, -1)
							.animation.define("walkLeft", [64, 65, 66, 65], 8, -1)
							.animation.define("walkRight", [76, 77, 78, 77], 8, -1)
							.animation.define("walkUp", [88, 89, 90, 89], 8, -1)
							.cell(52);

						this._restCell = 52;
						break;

					case 6:
						this.animation.define("walkDown", [55, 56, 57, 56], 8, -1)
							.animation.define("walkLeft", [67, 68, 69, 68], 8, -1)
							.animation.define("walkRight", [79, 80, 81, 80], 8, -1)
							.animation.define("walkUp", [91, 92, 93, 92], 8, -1)
							.cell(55);

						this._restCell = 55;
						break;

					case 7:
						this.animation.define("walkDown", [58, 59, 60, 59], 8, -1)
							.animation.define("walkLeft", [70, 71, 72, 71], 8, -1)
							.animation.define("walkRight", [82, 83, 84, 83], 8, -1)
							.animation.define("walkUp", [94, 95, 96, 95], 8, -1)
							.cell(58);

						this._restCell = 58;
						break;
				}
			}
		}
	};

	this.update = function (ctx, tickDelta) {
		if (ige.isClient) {
			// Set the current animation based on direction
			var self = this,
					oldX = this._lastTranslate.x,
					oldY = this._lastTranslate.y * 2,
					currX = this.translate().x(),
					currY = this.translate().y() * 2,
					distX = currX - oldX,
					distY = currY - oldY,
					distance = Math.distance(oldX, oldY, currX, currY),
					speed = 0.1,
					time = (distance / speed);

			this._lastTranslate = this._translate.clone();

			if (distX === 0 && distY === 0)
			{
				this.animation.stop();
			}
			else
			{
				// Set the animation based on direction
				if (Math.abs(distX) > Math.abs(distY))
				{
					// Moving horizontal
					if (distX < 0)
					{
						this.animation.select("walkLeft");
					}
					else
					{
						this.animation.select("walkRight");
					}
				}
				else
				{
					// Moving vertical
					if (distY < 0)
					{
						if (distX < 0)
						{
							this.animation.select("walkUp");
						}
						else
						{
							this.animation.select("walkRight");
						}
					}
					else
					{
						if (distX > 0)
						{
							this.animation.select("walkDown");
						}
						else
						{
							this.animation.select("walkLeft");
						}
					}
				}
			}

			// Set the depth to the y coordinate so that we can properly
			// draw "closer" entities on top of the "farther" ones.
			this.depth(this._translate.y);
		}

		IgeEntityBox2d.prototype.update.call(this, ctx, tickDelta);
	};
}

var Character = IgeEntityBox2d.extend(new Character());
if (typeof(module) !== "undefined" && typeof(module.exports) !== "undefined")
{
	module.exports = Character;
}
