function Control()
{
	this.classId = "Control";

	this.init = function()
	{
		this._active = false;
	}

	this.activate = function()
	{
		if(!this._active)
		{
			this._active = true;
			this.onActivation();
		}
	}

	this.onActivation = function()
	{
		throw "Must be overridden by child classes";
	}

	this.deactivate = function()
	{
		if(this._active)
		{
			this._active = false;
			this.onDeactivation();
		}
	}

	this.onDeactivation = function()
	{
		throw "Must be overridden by child classes";
	}
}
var Control = IgeClass.extend(new Control());

function DirectionControl()
{
	this.classId = "DirectionControl";

	this.init = function(direction, igeKey)
	{
	 Control.prototype.init.call(this);
	 this.direction = direction;
	 ige.input.mapAction(direction, igeKey);
 	}

	// we don't want to get in a state where the client and
	// server are on opposite sides of the same toggle so send
	// the value directly
	this.updateFunc = function()
	{
		if(ige.isClient)
		{
			var data = {
				"direction": this.direction,
				"setting": this._active
			};
			ige.network.send("controlUpdate", data);
		}
	}

	this.onActivation = function()
	{
		this.updateFunc();
	}

	this.onDeactivation = function()
	{
		this.updateFunc();
	}
}
var DirectionControl = Control.extend(new DirectionControl);

function Controls()
{
	this.classId = 'PlayerComponent';
	this.componentId = 'playerControl';

	this.init = function (entity, options) {
		var self = this;

		// Store the entity that this component has been added to
		this._entity = entity;
		// Store any options that were passed to us
		this._options = options;
		// DirectionControl is probably a bad name at this point
		this.controls = {
			left: new DirectionControl('left', ige.input.key.a),
			right: new DirectionControl('right', ige.input.key.d),
			up: new DirectionControl('up', ige.input.key.w),
			down: new DirectionControl('down', ige.input.key.s),
			action1: new DirectionControl('action1', ige.input.key.q),
			action2: new DirectionControl('action2', ige.input.key.e)
		};

		this._speed = 0.2;
		// Add the playerComponent behaviour to the entity
		this._entity.addBehaviour('playerComponent_behaviour', this._behaviour);
	}

	/**
	 * Called every frame by the engine when this entity is mounted to the
	 * scenegraph.
	 * @param ctx The canvas context to render to.
	 */
	this._behaviour = function (ctx) {
		var controls = this.playerControl.controls;

		if (ige.isServer)
		{
			var speed = this.playerControl._speed;

			// set up control precedents
			var x = controls.left._active ? -1 :
						  controls.right._active ? 1 : 0;
			var y = controls.up._active ? -1 :
							controls.down._active ? 1 : 0;

			// we want the character to move the same speed no matter
			// which direction they are going, so normalize and multiply by speed
			var norm = Math2d.normalize(new Vector2d(x,y));
			var vel = Math2d.scale(norm, speed);
			this.velocity.x(vel.x);
			this.velocity.y(vel.y);

			// for now q will just drain health :)
			if(controls.action1._active)
			{
				this.status.health(this.status.health() - 1);
 			}

 			// and e will drain power ;)
 			if(controls.action2._active)
 			{
				this.status.power(this.status.power() - 1);
			}
		}
		else // => ige.isClient
		{
			for(var key in controls)
			{
				if(controls.hasOwnProperty(key)){
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
	}

	return this;
};

var PlayerComponent = IgeEntity.extend(new Controls());
if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = PlayerComponent; }
