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
      var buttonSet = this.abilityButtons[cooldownInfo.name];
      var cooldown = cooldownInfo.cooldown;
      var interval = Math.floor(cooldown / 10);
      var counter = 1;

      buttonSet.cdButton.applyStyle({"height": 0 + "%"});
      var intervalId = setInterval(function()
      {
        if(counter === 9)
        {
          buttonSet.cdButton.applyStyle({"height": "90%"});
          clearInterval(intervalId);
        }
        else
        {
          var hardToUnderstandResult = Math.floor(((10 * counter++)) * 0.9);
          buttonSet.cdButton.applyStyle({"height": hardToUnderstandResult + "%"});
        }
      }, interval); // update cd info every 5x / second
    }
  };

  self.scene = new IgeScene2d()
    .id("uiScene")
    .layer(2)
    .ignoreCamera(true)
    .mount(mainScene);

  new IgeUiTimeStream().mount(self.scene);

  ige.ui.style(".controlPanel", {
    "width": "80%",
    "height": "7%",
    "bottom": "3%",
    "right": "10%"
  });

  ige.ui.style(".statusBars", {
    "width": "80%",
    "height": "100%",
    "borderColor": "black",
    "boderWidth": 3,
    "top": "0%",
    "left": "0%"
  });

  ige.ui.style(".healthBar", {
    "width": "100%",
    "height": "45%",
    "backgroundColor": "#4AA02C",
    "top": "0%",
    "left": "0%"
  });

  ige.ui.style(".powerBar", {
    "width": "100%",
    "height": "45%",
    "borderColor": "black",
    "boderWidth": 3,
    "backgroundColor": "#1569C7",
    "top": "55%%",
    "left": "0%"
  });

  ige.ui.style(".button1", {
    "width": "7%",
    "height": "90%",
    //"borderColor": "black",
    //"borderWidth": 3,
    "backgroundColor": "#837E7C",
    "right": "8%",
    "top": "5%"
  });

  ige.ui.style(".button2", {
    "width": "7%",
    "height": "90%",
    //"borderColor": "black",
    //"borderWidth": 3,
    "backgroundColor": "#837E7C",
    "right": "0%",
    "top": "5%"
  });

  ige.ui.style(".button1cd", {
    "width": "7%",
    "height": "90%",
    //"borderColor": "black",
    //"borderWidth": 3,
    "backgroundColor": "#CD7F32",
    "right": "8%",
    "top": "5%"
  });

  ige.ui.style(".button2cd", {
    "width": "7%",
    "height": "90%",
    //"borderColor": "black",
    //"borderWidth": 3,
    "backgroundColor": "#CD7F32",
    "right": "0%",
    "top": "5%"
  });

  ige.ui.style(".button1cd:hover", {
    "backgroundColor": "#D4A017"
  });

  ige.ui.style(".button2cd:hover", {
    "backgroundColor": "#D4A017"
  });

  var controlPanel = new IgeUiElement()
    .id("controlPanel")
    .styleClass("controlPanel")
    .mount(this.scene);

  var statusBars = new IgeUiElement()
    .id("statusBars")
    .styleClass("statusBars")
    .allowFocus(false)
    .mount(controlPanel);

  self.healthBar = new IgeUiElement()
    .id("healthBar")
    .styleClass("healthBar")
    .allowFocus(false)
    .mount(statusBars);

  self.powerBar = new IgeUiElement()
    .id("powerBar")
    .styleClass("powerBar")
    .allowFocus(false)
    .mount(statusBars);

  self.button1cd = new IgeUiElement()
    .id("button1cd")
    .styleClass("button1cd")
    .mount(controlPanel);

  self.button1 = new IgeUiElement()
    .id("button1")
    .styleClass("button1")
    .mount(controlPanel);

  self.button2cd = new IgeUiElement()
      .id("button2cd")
      .styleClass("button2cd")
      .mount(controlPanel);

  self.button2 = new IgeUiElement()
    .id("button2")
    .styleClass("button2")
    .mount(controlPanel);

  return this;
}

if (typeof(module) !== "undefined" && typeof(module.exports) !== "undefined") {
  module.exports = ControlPanel;
}
