var Math2d = {
  add: function(v1, v2){ return new Vector2d(v1.x + v2.x, v1.y + v2.y) },
  subtract: function(v1, v2){ return new Vector2d(v1.x - v2.x, v1.y - v2.y) },
  greaterThan: function(v1, v2){ return (v1.x > v2.x && v1.y > v2.y) },
  lessThan: function(v1, v2){ return (v1.x < v2.x && v1.y < v2.y) },
  scale: function(v1, scalar){ return new Vector2d(v1.x * scalar, v1.y * scalar) },
  equals: function(v1, v2){ return v1.x == v2.x && v1.y == v2.y },
  normalize: function(v){
    var magnitude = Math.sqrt(v.x*v.x + v.y*v.y);
    return new Vector2d(v.x/magnitude, v.y/magnitude);
  },
  isRoughlyNormalized: function(v){
    var magnitude = Math.sqrt(v.x*v.x + v.y*v.y);
    return Math.abs(1 - magnitude) < .001;
  },
  constants: {
    NORTH: { x: 0, y: -1 },
    SOUTH: { x: 0, y: 1 },
    EAST: { x: 1, y: 0 },
    WEST: { x: -1, y: 0 },
    STATIONARY: { x: 0, y: 0 }
  }
}

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') {
  module.exports = Math2d;
}
