/**
 * Creates shared cellsheets so that we don't have to continually
 * create / destroy cellsheets for common image sets. This can be
 * especially helpful with entities like projectiles where they
 * may be created for only a short time and we want to ensure the
 * images are loaded well before they are created and that entity init
 * time does not take too long for the client.
 * @class
 */
function SheetManager()
{
  var self = this;

  /** The set of cellsheets currently managed by the SheetManager */
  this.sheets = {};

  /**
   * Trigger the SheetManager to load a given sheet so that other classes
   * will be able to call a preloaded one. Useful when you want to make sure
   * that a short lived entity will be visible on its first initialization.
   * This should be called when the caller doesn't care about the cellsheet.
   * @param {string} name the server location of the cellsheet
   * @param {number} columns the number of columns in the cellsheet
   * @param {number} rows the number of rows in the cellsheet
   */
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

  /**
   * Trigger the SheetManager to load a given sheet, cache it for other
   * requests for the same sheet, and call when the sheet is ready.
   * @param {string} name the server location of the cellsheet
   * @param {function(CellSheet)} func the callback to be called with the sheet
   * @param {number} columns the number of columns in the cellsheet, optional
   *  if you are certain the sheet has been preloaded
   * @param {number} rows the number of rows in the cellsheet, optional
   *  if you are certain the sheet has been preloaded
   */
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
