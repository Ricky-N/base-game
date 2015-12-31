function ControlPanel(mainScene)
{
  var self = this;

  this.trackStatus = function(player)
  {
    player.status.on("healthChange", function(newHealth){
      // for now we know that 100 is the max health :/
      var width = newHealth;
      if(newHealth < 0)
      {
        width = 0;
      }
      self.healthBar.applyStyle({"width": width + "%"});
    });

    player.status.on("powerChange", function(newPower){
      var width = newPower;
      if(newPower < 0)
      {
        width = 0;
      }
      self.powerBar.applyStyle({"width": width + "%"});
    });
  };

  this.setAbilities = function(controlMetadata)
  {
    this.abilityButtons = {};

    var buttonSet = {};
    buttonSet.backgroundButton = this.button1;
    buttonSet.cdButton = this.button1cd;
    this.abilityButtons[controlMetadata[0].name] = buttonSet;

    buttonSet = {};
    buttonSet.backgroundButton = this.button2;
    buttonSet.cdButton = this.button2cd;
    this.abilityButtons[controlMetadata[1].name] = buttonSet;
  };

  // I want to see what kind of perf impact this has, so starting pretty choppy
  this.triggerCooldown = function(cooldownInfo)
  {
    if(cooldownInfo.cooldown)
    {
      var indicator = this.cooldownIndicators[cooldownInfo.index];
      var cooldown = cooldownInfo.cooldown;
      var updateIntervals = 30;
      var interval = Math.floor(cooldown / updateIntervals);
      var counter = 1;

      indicator.applyStyle({"height": 0 + "%"});
      var intervalId = setInterval(function()
      {
        if(counter === updateIntervals - 1)
        {
          clearInterval(intervalId);
        }
        var completedFraction = Math.floor(100 * (counter++ / updateIntervals));
        indicator.applyStyle({"height": completedFraction + "%"});
      }, interval); // update cd info every 5x / second
    }
  };

  this.scene = new IgeScene2d()
    .id("uiScene")
    .layer(2)
    .ignoreCamera(true)
    .mount(mainScene);

  //new IgeUiTimeStream().mount(self.scene);

  // the main control panel will sit on the bottom
  // of the screen and take up most of te width
  ige.ui.style(".controlPanel", {
    "width": "80%",
    "height": "7%",
    "bottom": "3%",
    "right": "10%"
  });
  var controlPanel = new IgeUiElement()
    .id("controlPanel")
    .styleClass("controlPanel")
    .mount(this.scene);

  // health / power indicators will take up the
  // middle of the control panel
  ige.ui.style(".statusBars", {
    "width": "80%",
    "height": "100%",
    "borderColor": "black",
    "boderWidth": 3,
    "top": "0%",
    "left": "0%"
  });
  var statusBars = new IgeUiElement()
    .id("statusBars")
    .styleClass("statusBars")
    .allowFocus(false)
    .mount(controlPanel);

  ige.ui.style(".healthBar", {
    "width": "100%",
    "height": "45%",
    "backgroundColor": "#4AA02C",
    "top": "0%",
    "left": "0%"
  });
  this.healthBar = new IgeUiElement()
    .id("healthBar")
    .styleClass("healthBar")
    .allowFocus(false)
    .mount(statusBars);

  ige.ui.style(".powerBar", {
    "width": "100%",
    "height": "45%",
    "borderColor": "black",
    "boderWidth": 3,
    "backgroundColor": "#1569C7",
    "top": "55%%",
    "left": "0%"
  });
  this.powerBar = new IgeUiElement()
    .id("powerBar")
    .styleClass("powerBar")
    .allowFocus(false)
    .mount(statusBars);

  // cooldown indicators will sit to the right
  ige.ui.style(".cooldowns", {
    "width": "15%",
    "height": "100%",
    "right": "0%"
  });
  var cooldowns = new IgeUiElement()
    .id("cooldowns")
    .styleClass("cooldowns")
    .allowFocus(false)
    .mount(controlPanel);

  // there will be an indicator for each ability,
  // set at 4 for now so just hardcode it as it
  // isn't very likely to change often enough to matter.
  ige.ui.style(".cooldownBackground", {
    "width": "22%", // 22*4 = 88, +3 gaps @ 4 px ea for now
    "height": "100%",
    "backgroundColor": "#837E7C"
    //"right": "x%", programmatically set
  });
  ige.ui.style(".cooldownIndicator", {
    "width": "22%",
    "height": "100%",
    "backgroundColor": "#CD7F32"
    //"right": "x%", programmatically set
  });
  // lets make it change colors for fun :)
  ige.ui.style(".cooldownIndicator:hover", {
    "backgroundColor": "#D4A017"
  });

  this.cooldownIndicators = [];
  for(var i = 0; i < 4; i++)
  {
    var cd = new IgeUiElement()
      .id("cd_" + i)
      .styleClass("cooldownIndicator")
      .mount(cooldowns)
      .applyStyle({
        "left": (i * 26) + "%" // 22% width + 4% space
      });

    new IgeUiElement()
      .id("cd_bg_" + i)
      .styleClass("cooldownBackground")
      .mount(cooldowns)
      .applyStyle({
        "left": (i * 26) + "%" // 22% width + 4% space
      });

    this.cooldownIndicators.push(cd);
  }

  return this;
}

if (typeof(module) !== "undefined" && typeof(module.exports) !== "undefined") {
  module.exports = ControlPanel;
}
