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
 * A DirectionControl is a Control that maps from keys to the
 * direction it will activate, and will actually tell the Server
 * when a change in this direction happens
 */
function DirectionControl()
{
	this.classId = "DirectionControl";

	this.init = function(direction, igeKey)
	{
	 Control.prototype.init.call(this);
	 this.direction = direction;
	 ige.input.mapAction(direction, igeKey);
 };

	// we don't want to get in a state where the client and
	// server are on opposite sides of the same toggle so send
	// the value directly
	this.updateFunc = function()
	{
		if(ige.isClient)
		{
			var data = {
				"type": "Direction",
				"control": this.direction,
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
var DirectionControl = Control.extend(new DirectionControl());

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

	this.init = function(set, action, igeKey, serverCallback)
	{
		var self = this;
		this._set = set;
		this.action = action;
		this.serverCallback = serverCallback;

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

function ToggleClickControlSet()
{
	this.classId = "ToggleClickControlSet";

	this.init = function(entity, options)
	{
		var self = this;
		this.controls = {
			action1: new ToggleClickControl(
				this, "action1", ige.input.key.q,
				ige.isServer ? entity.abilitySet.abilities[0].use : function(){}
			),
			action2: new ToggleClickControl(
				this, "action2", ige.input.key.e,
				ige.isServer ? entity.abilitySet.abilities[1].use : function(){}
			)
		};

		this.clickListener = null;
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
		for(var key in this.controls)
		{
			if(this.controls.hasOwnProperty(key)){
				if(ige.input.actionState(this.controls[key].action))
				{
					this.controls[key].activate();
				}
				else
				{
					this.controls[key].deactivate();
				}
			}
		}
	};
}
var ToggleClickControlSet = IgeClass.extend(new ToggleClickControlSet());

function Controls()
{
	this.classId = "PlayerComponent";
	this.componentId = "playerControl";

	this.init = function (entity, options)
	{
		var self = this;

		// Store the entity that this component has been added to
		this._entity = entity;
		// Store any options that were passed to us
		this._options = options;
		// DirectionControl is probably a bad name at this point
		this.controls = {
			left: new DirectionControl("left", ige.input.key.a),
			right: new DirectionControl("right", ige.input.key.d),
			up: new DirectionControl("up", ige.input.key.w),
			down: new DirectionControl("down", ige.input.key.s)
		};

		this.toggleClickControls = new ToggleClickControlSet(entity);

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

	/**
	 * Called every frame by the engine when this entity is mounted to the
	 * scenegraph.
	 * @param ctx The canvas context to render to.
	 */
	this._behaviour = function (ctx)
	{
		var controls = this.playerControl.controls;
		if (ige.isServer)
		{
			// set up control precedents
			var x = controls.left._active ? -1 : (controls.right._active ? 1 : 0);
			var y = controls.up._active ? -1 : (controls.down._active ? 1 : 0);

			// we want the character to move the same speed no matter
			// which direction they are going, so normalize and multiply by speed
			var norm = Math2d.normalize(new Vector2d(x,y));
			var vel = Math2d.scale(norm, this._speed);
			this.velocity.x(vel.x);
			this.velocity.y(vel.y);
		}
		else // => ige.isClient
		{
			this.playerControl.toggleClickControls.checkControls();
			for(var key in controls)
			{
				if(controls.hasOwnProperty(key))
				{
				  if(ige.input.actionState(controls[key].direction))
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
	};

	return this;
}

var PlayerComponent = IgeEntity.extend(new Controls());
if (typeof(module) !== "undefined" && typeof(module.exports) !== "undefined")
{
	module.exports = PlayerComponent;
}
