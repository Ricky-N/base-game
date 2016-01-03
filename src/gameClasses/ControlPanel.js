function ControlPanel(mainScene)
{
  var self = this;

  IgeUiButton.prototype.tick = function(ctx)
  {
    IgeUiElement.prototype.tick.call(this, ctx);

    if (this._value)
    {
      // Draw text
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = this._color;
      ctx.font = this._font || "20px Verdana";
      ctx.fillText(this._value, 0, 0);
    }
  };

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
        var completedFraction = Math.floor(96 * (counter++ / updateIntervals));
        indicator.applyStyle({"height": completedFraction + "%"});
      }, interval); // update cd info every 5x / second
    }
  };

  this.scene = new IgeScene2d()
    .id("uiScene")
    .layer(2)
    .ignoreCamera(true)
    .mount(mainScene);

  var colors = {
    border: "#954535",
    dark: "#C19A6B",
    light: "#FFEBCD",
    active: "#FBB917",
    cancel: "#E55451",
    health: "#4AA02C",
    power: "#1569C7"
  };

  //new IgeUiTimeStream().mount(self.scene);
  ige.ui.style(".rounded", {
    "borderRadius": 7
  });

  // the main control panel will sit on the bottom
  // of the screen and take up most of te width
  ige.ui.style(".controlPanel", {
    "width": "90%",
    "height": "7%",
    "bottom": "3%",
    "right": "5%"
  });
  var controlPanel = new IgeUiElement()
    .id("controlPanel")
    .styleClass("controlPanel")
    .allowFocus(false)
    .mount(this.scene);

  // buttons will sit on the left hand side
  ige.ui.style(".buttonPanel", {
    "width": "15%",
    "height": "100%",
    "left": "0%"
  });
  var buttonPanel = new IgeUiElement()
    .id("buttonPanel")
    .styleClass("buttonPanel")
    .allowFocus(false)
    .mount(controlPanel);

  ige.ui.style(".panelButton", {
    "backgroundColor": colors.light,
    "width": "80%",
    "height": "80%",
    "top": "10%",
    "left": "10%",
    "borderColor": colors.border,
    "borderWidth": 2,
  });
  var button = new IgeUiButton()
    .id("button")
    .styleClass("panelButton")
    .styleClass("rounded")
    .mount(buttonPanel);

  button._value = "Menu";
  button._mouseDown = function(){
    if(self.menu._hidden)
    {
      self.menu.show();
    }
    else{
      self.menu.hide();
    }
  };

  // health / power indicators will take up the
  // middle of the control panel
  ige.ui.style(".statusBars", {
    "width": "60%",
    "height": "100%",
    "borderColor": "black",
    "boderWidth": 3,
    "top": "0%",
    "left": "20%"
  });
  var statusBars = new IgeUiElement()
    .id("statusBars")
    .styleClass("statusBars")
    .allowFocus(false)
    .mount(controlPanel);

  ige.ui.style(".healthBar", {
    "width": "100%",
    "height": "45%",
    "backgroundColor": colors.health,
    "top": "0%",
    "left": "0%"
  });
  this.healthBar = new IgeUiElement()
    .id("healthBar")
    .styleClass("healthBar")
    .styleClass("rounded")
    .allowFocus(false)
    .mount(statusBars);

  ige.ui.style(".powerBar", {
    "width": "100%",
    "height": "45%",
    "borderColor": "black",
    "boderWidth": 3,
    "backgroundColor": colors.power,
    "top": "55%%",
    "left": "0%"
  });
  this.powerBar = new IgeUiElement()
    .id("powerBar")
    .styleClass("powerBar")
    .styleClass("rounded")
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
    "backgroundColor": colors.dark
    //"right": "x%", programmatically set
  });
  ige.ui.style(".cooldownIndicator", {
    "width": "18%",
    "height": "96%",
    "bottom": "2%",
    "backgroundColor": colors.active
    //"right": "x%", programmatically set
  });
  // lets make it change colors for fun :)
  ige.ui.style(".cooldownBubble", {
    "backgroundColor": colors.light,
    "height": "40%",
    "width": "30%",
    "top": "8%",
    "right": "5%"
  });

  this.cooldownIndicators = [];
  for(var i = 0; i < 4; i++)
  {

    var cd = new IgeUiElement()
      .id("cd_" + i)
      .styleClass("cooldownIndicator")
      .styleClass("rounded")
      .mount(cooldowns)
      .applyStyle({
        "left": 2 + (i * 26) + "%" // 22% width + 4% space
      });

    new IgeUiElement()
      .id("cd_bubble_" + i)
      .styleClass("cooldownBubble")
      .styleClass("rounded")
      .mount(cd);

    new IgeUiElement()
      .id("cd_bg_" + i)
      .styleClass("cooldownBackground")
      .styleClass("rounded")
      .mount(cooldowns)
      .applyStyle({
        "left": (i * 26) + "%" // 22% width + 4% space
      });

    this.cooldownIndicators.push(cd);
  }

  // setting up the menu that gets shown when they click something!
  ige.ui.style(".menuBackground", {
    "backgroundColor": colors.dark,
    "width": "60%",
    "height": "60%",
    "top": "15%",
    "left": "20%",
    "borderColor": colors.border,
    "borderWidth": 5
  });
  this.menu = new IgeUiElement()
    .id("menu")
    .styleClass("menuBackground")
    .styleClass("rounded")
    .mount(this.scene);
  this.menu.hide();

  ige.ui.style(".menuPane", {
    "backgroundColor": colors.light,
    "width": "96%",
    "left": "2%",
    "height": "84%",
    "top": "14%"
  });
  var menuPane1 = new IgeUiElement()
    .id("menuPane1")
    .styleClass("menuPane")
    .styleClass("rounded")
    .mount(this.menu);

  ige.ui.style(".abilityButton", {
    "width": "15%",
    "height": "20%",
    "left": "2%"
  });

  var abilityButtons = [];
  var activeIndex = 0;

  function abilityButtonMouseDown()
  {
    abilityButtons[activeIndex].applyStyle({
      "backgroundColor": colors.dark
    });
    activeIndex = this.index;
    abilityButtons[activeIndex].applyStyle({
      "backgroundColor": colors.active
    });
  }

  for(i = 0; i < 4; i++)
  {
    var abilityButton = new IgeUiButton()
      .id("abilityButton" + i)
      .styleClass("abilityButton")
      .styleClass("rounded")
      .applyStyle({
        "top": 3 + (24 * i) + "%",
        "backgroundColor": colors.dark
      })
      .mount(menuPane1);

    abilityButton.index = i;
    abilityButton._value = "Ability " + i;
    abilityButton._mouseDown = abilityButtonMouseDown;
    abilityButtons.push(abilityButton);
  }
  abilityButtons[0].applyStyle({"backgroundColor": colors.active});

  // TODO: this seems to refuse to follow my width guidelines
  ige.ui.style(".divider", {
    "backgroundColor": colors.border,
    "width": "1%",
    "height": "96%",
    "top": "2%",
    "left": "19%"
  });
  divider = new IgeUiElement()
    .id("divider")
    .styleClass("divider")
    .styleClass("rounded")
    .allowFocus(false)
    .mount(menuPane1);


  var menuPane2 = new IgeUiElement()
    .id("menuPane2")
    .styleClass("menuPane")
    .styleClass("rounded")
    .mount(this.menu)
    .hide();


  var activePane = menuPane1;

  ige.ui.style(".menuTab", {
    // can't apply styles over the top of this class
    //"backgroundColor": "#FFEBCD",
    "width": "20%",
    "height": "10%",
    "top": "2%"
  });
  var tab1 = new IgeUiButton()
    .id("menuTab1")
    .styleClass("menuTab")
    .styleClass("rounded")
    .applyStyle({"left": "2%"})
    .applyStyle({"backgroundColor": colors.active})
    .mount(this.menu);

  tab1._value = "Abilities";
  tab1._mouseDown = function()
  {
    if(menuPane1._hidden)
    {
      tab1.applyStyle({"backgroundColor": colors.active});
      menuPane1.show();
      tab2.applyStyle({"backgroundColor": colors.light});
      activePane.hide();
      activePane = menuPane1;
    }
  };

  var tab2 = new IgeUiButton()
    .id("menuTab2")
    .styleClass("menuTab")
    .styleClass("rounded")
    .applyStyle({"left": "24%"})
    .applyStyle({"backgroundColor": colors.light})
    .mount(this.menu);

  tab2._value = "Settings";
  tab2._mouseDown = function()
  {
    if(menuPane2._hidden)
    {
      tab2.applyStyle({"backgroundColor": colors.active});
      menuPane2.show();
      tab1.applyStyle({"backgroundColor": colors.light});
      activePane.hide();
      activePane = menuPane2;
    }
  };

  ige.ui.style(".close", {
    "backgroundColor": colors.cancel,
    "width": "10%",
    "height": "10%",
    "top": "2%",
    "right": "2%",
    "borderRadius": 10
  });
  var close = new IgeUiButton()
    .id("closeButton")
    .styleClass("close")
    .mount(this.menu);
  close._value = "X";
  close._mouseDown = function()
  {
    self.menu.hide();
  };

  return this;
}

if (typeof(module) !== "undefined" && typeof(module.exports) !== "undefined") {
  module.exports = ControlPanel;
}
