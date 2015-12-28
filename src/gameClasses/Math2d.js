function Math2d()
{
  this.add = function(v1, v2)
  {
    return new Vector2d(v1.x + v2.x, v1.y + v2.y);
  };

  this.subtract = function(v1, v2)
  {
    return new Vector2d(v1.x - v2.x, v1.y - v2.y);
  };

  this.greaterThan = function(v1, v2)
  {
    return (v1.x > v2.x && v1.y > v2.y);
  };

  this.lessThan = function(v1, v2)
  {
    return (v1.x < v2.x && v1.y < v2.y);
  };

  this.scale = function(v1, scalar)
  {
    return new Vector2d(v1.x * scalar, v1.y * scalar);
  };

  this.equals = function(v1, v2)
  {
    return v1.x === v2.x && v1.y === v2.y;
  };

  this.normalize = function(v)
  {
    var magnitude = Math.sqrt(v.x*v.x + v.y*v.y);
    return new Vector2d(v.x/magnitude, v.y/magnitude);
  };

  this.isRoughlyNormalized = function(v)
  {
    var magnitude = Math.sqrt(v.x*v.x + v.y*v.y);
    return Math.abs(1 - magnitude) < 0.001;
  };

  this.pythagoras = function(v)
  {
    return Math.sqrt(Math.pow(v.x, 2), Math.pow(v.y, 2));
  };

  this.constants = {
    NORTH: { x: 0, y: -1 },
    SOUTH: { x: 0, y: 1 },
    EAST: { x: 1, y: 0 },
    WEST: { x: -1, y: 0 },
    STATIONARY: { x: 0, y: 0 }
  };
}

if (typeof(module) !== "undefined" && typeof(module.exports) !== "undefined") {
  module.exports = new Math2d();
}
