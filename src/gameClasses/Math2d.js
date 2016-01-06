/**
 * Provides math utilities for manipulating the 2d vector space
 * @class
 * @static
 */
function Math2d()
{
  /**
   * Returns a new vector resulting from vector addition
   * @param {Vector2d} v1 the first vector
   * @param {Vector2d} v2 the second vector
   * @return {Vector2d} the result of vector addition
   */
  this.add = function(v1, v2)
  {
    return new Vector2d(v1.x + v2.x, v1.y + v2.y);
  };

  /**
   * Returns a new vector resulting from vector subtraction
   * @param {Vector2d} v1 the first vector
   * @param {Vector2d} v2 the second vector
   * @return {Vector2d} the result of vector subtraction
   */
  this.subtract = function(v1, v2)
  {
    return new Vector2d(v1.x - v2.x, v1.y - v2.y);
  };

  /**
   * True if both components of v1 are greater than both components of v2
   * @param {Vector2d} v1 the first vector
   * @param {Vector2d} v2 the second vector
   * @return {boolean} whether v1 is greater than v2
   */
  this.greaterThan = function(v1, v2)
  {
    return (v1.x > v2.x && v1.y > v2.y);
  };

  /**
   * True if both components of v1 are less than both components of v2,
   * provided mostly for clarity in logic using Math2d
   * @param {Vector2d} v1 the first vector
   * @param {Vector2d} v2 the second vector
   * @return {boolean} whether v1 is less than v2
   */
  this.lessThan = function(v1, v2)
  {
    return (v1.x < v2.x && v1.y < v2.y);
  };

  /**
   * Performs scalar multiplcation on the provided vector
   * @param {Vector2d} v1 the vector to be scaled
   * @param {number} scalar the value by which to scale the vector
   * @return {Vector2d} the result of scalar multiplication
   */
  this.scale = function(v1, scalar)
  {
    return new Vector2d(v1.x * scalar, v1.y * scalar);
  };

  /**
   * True if both components are exactly equal
   * @param {Vector2d} v1 the first vector
   * @param {Vector2d} v2 the second vector
   * @return {boolean} whether v1 is equal to v2
   */
  this.equals = function(v1, v2)
  {
    return v1.x === v2.x && v1.y === v2.y;
  };

  /**
   * Returns a normalized vector, meaning the result has mangitude 1
   * and points in the same direction as the passed vector
   * @param {Vector2d} v the vector to normalize
   * @return {Vector2d} the normalized vector
   */
  this.normalize = function(v)
  {
    var magnitude = Math.sqrt(v.x*v.x + v.y*v.y);
    return new Vector2d(v.x/magnitude, v.y/magnitude);
  };

  /**
   * Tests to see if a vector is close to having magnitude 1
   * @param {Vector2d} v the vector to normalize
   * @return {boolean} whether the vector is normalized
   */
  this.isRoughlyNormalized = function(v)
  {
    var magnitude = Math.sqrt(v.x*v.x + v.y*v.y);
    return Math.abs(1 - magnitude) < 0.001;
  };

  /**
   * Given a vector, determines the straight line distance from it's
   * origin to it's tip through the pythagorean theorem
   * @param {Vector2d} v the vector in question
   * @return {Number} the scalar length of the vector
   */
  this.pythagoras = function(v)
  {
    return Math.sqrt(Math.pow(v.x, 2), Math.pow(v.y, 2));
  };

  /**
   * Vector constants to make comparisons more clear
   * @property {Vector2d} NORTH vector pointing screen up
   * @property {Vector2d} SOUTH vector pointing screen down
   * @property {Vector2d} EAST vector pointing screen right
   * @property {Vector2d} WEST vector pointing screen left
   * @property {Vector2d} STATIONARY zero, zero vector
   */
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
