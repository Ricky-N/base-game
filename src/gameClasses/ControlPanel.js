function ControlPanel(mainScene)
{
  var self = this;

  this.trackStatus = function(player)
  {
    player.status.on('healthChange', function(newHealth){
      // for now we know that 100 is the max health :/
      var width = newHealth;
      if(newHealth < 0)
      {
        width = 0;
      }
      self.healthBar.applyStyle({'width': width + '%'});
    });

    player.status.on('powerChange', function(newPower){
      var width = newPower;
      if(newPower < 0)
      {
        width = 0;
      }
      self.powerBar.applyStyle({'width': width + '%'});
    });
  }

  self.scene = new IgeScene2d()
    .id('uiScene')
    .layer(2)
    .ignoreCamera(true)
    .mount(mainScene);

  ige.ui.style('.controlPanel', {
    'width': '80%',
    'height': '7%',
    'bottom': '3%',
    'right': '10%'
  });

  ige.ui.style('.statusBars', {
    'width': '80%',
    'height': '100%',
    'borderColor': 'black',
    'boderWidth': 3,
    'top': '0%',
    'left': '0%'
  });

  ige.ui.style('.healthBar', {
    'width': '100%',
    'height': '45%',
    'backgroundColor': 'green',
    'top': '0%',
    'left': '0%'
  });

  ige.ui.style('.powerBar', {
    'width': '100%',
    'height': '45%',
    'borderColor': 'black',
    'boderWidth': 3,
    'backgroundColor': 'blue',
    'top': '55%%',
    'left': '0%'
  });

  ige.ui.style('.button', {
    'width': '15%',
    'height': '90%',
    'borderColor': 'black',
    'borderWidth': 3,
    'backgroundColor': 'brown',
    'right': '0%',
    'top': '5%'
  });

  ige.ui.style('.button:hover', {
    'backgroundColor': 'red'
  });

  var controlPanel = new IgeUiElement()
    .id('controlPanel')
    .styleClass('controlPanel')
    .mount(this.scene);

  var statusBars = new IgeUiElement()
    .id('statusBars')
    .styleClass('statusBars')
    .allowFocus(false)
    .mount(controlPanel);

  self.healthBar = new IgeUiElement()
    .id('healthBar')
    .styleClass('healthBar')
    .allowFocus(false)
    .mount(statusBars);

  self.powerBar = new IgeUiElement()
    .id('powerBar')
    .styleClass('powerBar')
    .allowFocus(false)
    .mount(statusBars);

  self.button = new IgeUiElement()
    .id('button')
    .styleClass('button')
    .mount(controlPanel);

  return this;
}

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') {
  module.exports = ControlPanel;
}
