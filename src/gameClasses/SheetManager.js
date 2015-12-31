// There are certain things like projectiles that we spawn
// many times where the CellSheet / SpriteSheet will be the
// same across every instance. We can use a global sheet
// manager in these cases to keep this from getting too bad.
function SheetManager()
{
  var self = this;

  this.sheets = {};

  // use this if you don't care about the sheet but want to get it loaded
  this.loadSheet = function(name, columns, rows)
  {
    if(!this.sheets.hasOwnProperty(name))
    {
      var sheet = new IgeCellSheet(name, columns, rows);
      this.sheets[name] = {
        loaded: false,
        sheet: sheet,
        callbacks: []
      };

      sheet.on("loaded", function() {
        self.sheets[name].loaded = true;
        var callbacks = self.sheets[name].callbacks;
        for(var i = 0; i < callbacks.length; i++)
        {
          callbacks[i](self.sheets[name].sheet);
        }
      }, false, true);
    }
  };

  // call this if you want the sheet once it is loaded, if you are sure
  // that you are calling this after it has been loaded, you can omit
  // columns and rows, but it will error if you are wrong :)
  this.registerCallback = function(name, func, columns, rows)
  {
    if(!this.sheets.hasOwnProperty(name))
    {
      if(typeof columns === "undefined" || typeof rows === "undefined")
      {
        throw "Columns or rows undefined when splitting cell sheet";
      }

      var sheet = new IgeCellSheet(name, columns, rows);
      this.sheets[name] = {
        loaded: false,
        sheet: sheet,
        callbacks: [func]
      };

      sheet.on("loaded", function() {
        self.sheets[name].loaded = true;
        var callbacks = self.sheets[name].callbacks;
        for(var i = 0; i < callbacks.length; i++)
        {
          callbacks[i](self.sheets[name].sheet);
        }
      }, false, true);
    }
    else if(this.sheets[name].loaded === false)
    {
      this.sheets[name].callbacks.push(func);
    }
    else
    {
      func(this.sheets[name].sheet);
    }
  };

  return this;
}

// client side only, doesn't matter!
// if (typeof(module) !== "undefined" && typeof(module.exports) !== "undefined") {
//   module.exports = AbilitySheetManager;
// }
