function ControlPanel(mainScene)
{
  this.scene = new IgeScene2d()
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

  ige.ui.style('.healthBar', {
    'width': '80%',
    'height': '45%',
    'borderColor': 'black',
    'boderWidth': 3,
    'backgroundColor': 'green',
    'top': '0%',
    'left': '0%'
  });

  ige.ui.style('.powerBar', {
    'width': '80%',
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

  new IgeUiElement()
    .id('healthBar')
    .styleClass('healthBar')
    .allowFocus(false)
    .mount(controlPanel);

  new IgeUiElement()
    .id('powerBar')
    .styleClass('powerBar')
    .allowFocus(false)
    .mount(controlPanel);

  new IgeUiElement()
    .id('button')
    .styleClass('button')
    .mount(controlPanel);
    
  return this;
}

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') {
  module.exports = ControlPanel;
}
