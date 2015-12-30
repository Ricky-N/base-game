/**
 * This type of control has a single state variable and is either active
 * or inactive. If activated when it was inactive, it will call onActivation
 * otherwise it will do nothing. Deactivation acts the same way but in reverse.
 */
function Control()
{
	this.classId = "Control";

	this.init = function()
	{
		this._active = false;
	};

	this.activate = function()
	{
		if(!this._active)
		{
			this._active = true;
			this.onActivation();
		}
	};

	this.onActivation = function()
	{
		throw "Must be overridden by child classes";
	};

	this.deactivate = function()
	{
		if(this._active)
		{
			this._active = false;
			this.onDeactivation();
		}
	};

	this.onDeactivation = function()
	{
		throw "Must be overridden by child classes";
	};
}
var Control = IgeClass.extend(new Control());

/**
 * A PressControl is a Control that is pressed to try to use the
 * assigned action for the duration of time it is pressed, and released
 * to do nothing. When pressed it is on.
 */
function PressControl()
{
	this.classId = "PressControl";

	this.init = function(action, key, ability, networkVerb)
	{
		Control.prototype.init.call(this);
		this.action = action;
		ige.input.mapAction(action, key);
		this.ability = ability;
		this.networkVerb = networkVerb ? networkVerb : "Press";
 	};

	// we don't want to get in a state where the client and
	// server are on opposite sides of the same toggle so send
	// the value directly
	this.updateFunc = function()
	{
		if(ige.isClient)
		{
			var data = {
				"type": this.networkVerb,
				"control": this.action,
				"data": this._active
			};
			ige.network.send("controlUpdate", data);
		}
	};

	this.onActivation = function()
	{
		this.updateFunc();
	};

	this.onDeactivation = function()
	{
		this.updateFunc();
	};
}
var PressControl = Control.extend(new PressControl());

/**
 * A ToggleControl is turned on first button activation, and off on the second
 */
function ToggleControl()
{
	this.classId = "ToggleControl";

	this.init = function()
	{
		var self = this;
		this._active = false;

		this._control = new Control();
		this._control.onActivation = function()
		{
			self._active = !self._active;
			if(self._active)
			{
				self.onActivation();
			}
			else
			{
				self.onDeactivation();
			}
		};
		this._control.onDeactivation = function(){};
	};

	// used to force reset of all state back to off while calling properly
	this.clear = function()
	{
		// this will call ondeactivate for sure and onactivate if it was
		// already in a low state.
		this._control.activate();
		this._control.deactivate();
	};

	this.activate = function()
	{
		this._control.activate();
	};

	this.deactivate = function()
	{
		this._control.deactivate();
	};

	this.onActivation = function()
	{
		throw "Must be overridden by child classes";
	};

	this.onDeactivation = function()
	{
		throw "Must be overridden by child classes";
	};
}
var ToggleControl = IgeClass.extend(new ToggleControl());

/**
 * A ToggleClickControl is one that is activated by a button press. Once the
 * button is pressed, the next click on screen will tell the server the desired
 * action. If the button is pressed again, it will stop listening. Because
 * different ToggleClickControls override each other, all of them must belong
 * to a single ToggleClickControlSet.
 */
function ToggleClickControl()
{
	this.classId = "ToggleClickControl";

	this.init = function(set, action, igeKey, ability)
	{
		var self = this;
		this._set = set;
		this.action = action;
		this.ability = ability;

		this._control = new ToggleControl();
		this._control.onActivation = function()
		{
			if(self._set.clickListener)
			{
				self._set.controls[self._set.clickListener].clear();
			}
			self._set.clickListener = self.action;
		};
		this._control.onDeactivation = function()
		{
			if(self._set.clickListener === self.action)
			{
				self._set.clickListener = null;
			}
		};
		ige.input.mapAction(action, igeKey);
	};

	this.onToggleClick = function(event)
	{
		var data = {
			"type": "ToggleClick",
			"control": this.action,
			"data": { x: event.x, y: event.y }
		};
		ige.network.send("controlUpdate", data);
		this.clear();
	};

	this.clear = function()
	{
		this._control.clear();
	};

	this.activate = function()
	{
		this._control.activate();
	};

	this.deactivate = function()
	{
		this._control.deactivate();
	};
}
var ToggleClickControl = IgeClass.extend(new ToggleClickControl());

// common helper method to activate control if pressed
function checkControls(controls)
{
	for(var key in controls)
	{
		if(controls.hasOwnProperty(key)){
			if(ige.input.actionState(controls[key].action))
			{
				controls[key].activate();
			}
			else
			{
				controls[key].deactivate();
			}
		}
	}
}

function ToggleClickControlSet()
{
	this.classId = "ToggleClickControlSet";

	this.init = function(entity, options)
	{
		var self = this;
		this.controls = {};
		this.clickListener = null;
	};

	this.addControl = function(name, key, ability)
	{
		this.controls[name] = new ToggleClickControl(
			this, name, key, ability
		);
	};

	this.triggerClick = function(event)
	{
		if(this.clickListener)
		{
			this.controls[this.clickListener].onToggleClick(event);
		}
	};

	this.hasActiveControl = function()
	{
		return this.clickListener !== null;
	};

	this.checkControls = function()
	{
		checkControls(this.controls);
	};
}
var ToggleClickControlSet = IgeClass.extend(new ToggleClickControlSet());

function Controls()
{
	this.classId = "PlayerComponent";
	this.componentId = "playerControl";

	this.init = function (entity, controlMetadata)
	{
		var self = this;
		this._entity = entity;

		// each player has a fixed number of abilities, this will map from
		// ability index in their abilitySet abilities to key that controls it
		// TODO: variable player config, not static mapping
		this.abilityIndexToControl = [
			{ name: "action1", key: ige.input.key.q },
			{ name: "action2", key: ige.input.key.e }
		];

		this.directionControls = {
			left: new PressControl("left", ige.input.key.a, {}, "Direction"),
			right: new PressControl("right", ige.input.key.d, {}, "Direction"),
			up: new PressControl("up", ige.input.key.w, {}, "Direction"),
			down: new PressControl("down", ige.input.key.s, {}, "Direction")
		};

		this.pressControls = {};
		this.toggleClickControls = new ToggleClickControlSet(entity);
		this.addAbilityControls(controlMetadata);

		if(ige.isClient)
		{
			ige.client.mainScene.mouseDown(function()
			{
				var event = ige._currentViewport.mousePos();
				if(self.toggleClickControls.hasActiveControl())
				{
					self.toggleClickControls.triggerClick(event);
				}
				else
				{
					// if none of the toggleClickControls are active, we can use this click event
					var data = {
						"type": "Click",
						"data": { x: event.x, y: event.y }
					};
					ige.network.send("controlUpdate", data);
				}
			});
		}

		// Add the playerComponent behaviour to the entity
		this._entity.addBehaviour("playerComponent_behaviour", this._behaviour);
	};

	this.addAbilityControls = function(abilityControls)
	{
		for(var i = 0; i < abilityControls.length; i++)
		{
			// TODO: do we need a switch?
			if(abilityControls[i] === "ToggleClickControl")
			{
				this.toggleClickControls.addControl(
					this.abilityIndexToControl[i].name,
					this.abilityIndexToControl[i].key,
					ige.isServer ? this._entity.abilitySet.abilities[i] : {}
				);
			}
			else if(abilityControls[i] === "PressControl")
			{
				this.pressControls[this.abilityIndexToControl[i].name] =
					new PressControl(
						this.abilityIndexToControl[i].name,
						this.abilityIndexToControl[i].key,
						ige.isServer ? this._entity.abilitySet.abilities[i] : {}
					);
			}
		}
	};

	/**
	 * Called every frame by the engine when this entity is mounted to the
	 * scenegraph.
	 * @param ctx The canvas context to render to.
	 */
	this._behaviour = function (ctx)
	{
		if (ige.isServer)
		{
			var controls = this.playerControl.pressControls;
			for(var key in controls)
			{
				if(controls.hasOwnProperty(key) && controls[key]._active)
				{
					controls[key].ability.use();
				}
			}

			if(this.status._movementEnabled)
			{
				// Direction controls are a special case because there is a slightly
				// complex relationship between the different controls that we need
				// to handle as efficiently as possible, so we set them aside
				controls = this.playerControl.directionControls;
				var x = controls.left._active ? -1 : (controls.right._active ? 1 : 0);
				var y = controls.up._active ? -1 : (controls.down._active ? 1 : 0);

				// we want the character to move the same speed no matter
				// which direction they are going, so normalize and multiply by speed
				var vel, controlVec = new Vector2d(x,y);
				if(!Math2d.equals(Math2d.constants.STATIONARY, controlVec))
				{
					var norm = Math2d.normalize(controlVec);
					vel = Math2d.scale(norm, this._speed);
				}
				else
				{
					vel = controlVec;
				}
				// TODO: do we need velocity component when we have box2d? 
				//this._box2dBody.SetLinearVelocity(vel);
				this.velocity.x(vel.x);
				this.velocity.y(vel.y);
			}
		}
		else // => ige.isClient
		{
			this.playerControl.toggleClickControls.checkControls();
			checkControls(this.playerControl.directionControls);
			checkControls(this.playerControl.pressControls);
		}
	};

	return this;
}

var PlayerComponent = IgeEntity.extend(new Controls());
if (typeof(module) !== "undefined" && typeof(module.exports) !== "undefined")
{
	module.exports = PlayerComponent;
}
