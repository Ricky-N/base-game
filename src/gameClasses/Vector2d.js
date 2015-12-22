function Vector2d(x,y)
{
  this.x = x;
  this.y = y;
	return this;
}

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') {
  module.exports = Vector2d;
}
