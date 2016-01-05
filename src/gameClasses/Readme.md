## How Classes Work

Isogenic Game Engine has it's own class inheritance system built up. To define a
new class you call the IgeClass extend method of whatever class you want to
extend. You will probably want to call the super method like this:
		{SuperClassName}.prototype.init.call(this);

I attempted to merge this class system with new es6 classes and use Babel to
have them talk, but was pretty unsuccessful. I believe there were problems
with the export method and sort of gave up, but it may be worth a look in the future.

For now, I recommend using module syntax to generate singleton objects which you
then pass directly to the IgeClass you are trying to extend. This means you
don't have to deal with the dumb comma syntax of objects and can have things like
private variables and functions. An example class for this purpose:

  function myClass()
  {
    // we do this because calling "this.whatever" in a function will actually
    // refer to the function being called in many cases (think how this classes
    // is actually a function itself), so self will still have a reference to this
    var self = this;

    self.init = function()
    {
      // do something
    }

    // these are private because they are only accessible within the scope of
    // this anonymously executing function. They are not private in a traditional
    // sense though as any .extend of this object will not have access to these!!
    // If you need a "class-wide" private variable, I would suggest just making
    // it public with an underscore on the front. This is typical to javascript,
    // even next gen javascript classes will not have a good notion of private.
    var privateVar = "can't be seen by myClass.privateVar";
    function doPrivateStuff()
    {
      console.log(privateVar);
    }

    self.publicVar = "Will be directly acessible from myClass.publicVar"
    self.doStuff = function()
    {
      doPrivateStuff();
    }

    // this is what will actually give us access to all of the above, if you forget
    // this part you will just get typeof myClass === "undefined"
    return self;

  }

  // then we would want to do something like extend an existing IgeClass
  // and export the IgeClass so that the above doesn't even make it out of this scope
  var myClass = IgeClass.extend(new myClass());
  if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = myClass;

I would pretty strongly recommend setting the var and function to the same name.
This basically gets rid of the class you just defined and replaces it with the
IgeClass which has all the same methods, plus those its inherited from.
