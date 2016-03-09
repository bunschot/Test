var UI = require('ui');
var Vector2 = require('vector2');
var autobahn = require('autobahn');


var connection = new autobahn.Connection({
  url: 'ws://demo.crossbar.io:8080',
  realm: 'realm1'
});

var registrations;

connection.onopen = function (session) {
  // 1) subscribe to a topic
  function onevent(args) {
    console.log("Event:", args[0]);
  }
  session.subscribe('com.myapp.hello', onevent);
  console.log("subscribed to event");

  // 2) publish an event
  session.publish('com.myapp.hello', ['Hello, world!']);
  console.log("published to a topic");

  // 3) register a procedure for remoting
  function add2(args) {
    return args[0] + args[1];
  }
  session.register('com.myapp.mycooladder', add2).then(
    function (registration) {
      registrations = registration;
    }
  );
  console.log("registered an rpc");

  // 4) call a remote procedure
  session.call('com.myapp.mycooladder', [2, 3]).then(
    function (res) {
      console.log("Result:", res);
    }
  );
  console.log("called an rpc");
};

connection.open();

connection.onclose = function(reason, details) {
  console.log('connection closed ' + reason + details);
  this.session.unregister(registrations).then(
    function () {
      console.log('successfully unregistered registrations');
    },
    function (error) {
      console.log('unregister failed');
    }
  );
};



var main = new UI.Window({
    fullscreen: true,
  });

var imgprt = new UI.Image({
  position: new Vector2(0, 0),
  size: new Vector2(144, 168),
  image: 'images/prt-dithered.png'
});

var textfield = new UI.Text({
    position: new Vector2(0, 100),
    size: new Vector2(144, 30),
    font: 'gothic-24-bold',
    text: 'Welcome!',
    textAlign: 'center',
    color: 'black'
  });

main.add(imgprt);
main.add(textfield);

main.on('show', function() {
  console.log('Showing window!');
  main.show(imgprt);
  main.show(textfield);
});

main.show();


main.on('click', 'up', function(e) {
  
  var menu = new UI.Menu({
    sections: [{
      items: [{
        title: 'Start',
        subtitle: 'Start operations',
        icon: 'images/logo.png',
      }, {
        title: 'Stop',
        subtitle: 'Stop operations',
        icon: 'images/logo.png'
      }]
    }]
  });
  menu.on('select', function(e) {
    console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
    console.log('The item is titled "' + e.item.title + '"');
    connection.session.call('com.myapp.mycooladder', [e.ItemIndex, e.sectionIndex]).then(
      function (res) {
        console.log("Result:", res);
      }
  );
  });
  menu.show();
});

main.on('click', 'select', function(e) {
  var wind = new UI.Window({
    fullscreen: true,
  });
  var textfield = new UI.Text({
    position: new Vector2(0, 65),
    size: new Vector2(144, 30),
    font: 'gothic-24-bold',
    text: 'Text Anywhere!',
    textAlign: 'center'
  });
  
  var circle = new UI.Circle({
    position: new Vector2(72,84),
    radius:25,
    bordercolor:'white',
  });
  
  var socket = new WebSocket('ws://echo.websocket.org/');
  socket.onopen = function(){
    socket.send('PING');
    console.log('sent ping');
  };
  socket.onmessage = function(e){
    console.log('got response: ' + e.data);
    socket.close();
  };
  socket.onclose = function(e){
    console.log('closed');
  };
   
  wind.add(textfield);
  wind.add(circle);
  wind.show();
});

main.on('click', 'down', function(e) {
  var card = new UI.Card();
  card.title('A Card');
  card.subtitle('Is a Window');
  card.body('The simplest window type in Pebble.js.');
  card.show();
});