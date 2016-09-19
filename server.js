// require express
var express = require("express");
// path module -- try to figure out where and why we use this
var path = require("path");
// create the express app
var app = express();
var bodyParser = require('body-parser');
// use it!
app.use(bodyParser.urlencoded({ extended: true }));
// static content
app.use(express.static(path.join(__dirname, "./static")));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.use('/node_modules',  express.static(__dirname + '/node_modules'));
// setting up ejs and our views folder
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
// root route to render the index.ejs view
app.get('/', function(req, res) {
 res.render("index");
});
// post route for adding a user
app.post('/results', function(req, res) {
 console.log("POST DATA", req.body);
 console.log(req.body.survey.name);
 res.render("results", {results: req.body});
 // res.redirect("results");
})
// tell the express app to listen on port 8000
var server = app.listen(8000, function() {
 console.log("listening on port 8000");
});
var io = require('socket.io').listen(server);
var users = []; 
// Whenever a connection event happens (the connection event is built in) run the following code
io.sockets.on('connection', function (socket) {
  console.log("WE ARE USING SOCKETS!");
  console.log(socket.id);
  socket.on("got_a_new_user", function(data){
  	console.log(data.name);
  	socket.broadcast.emit("new_user", {message:""+data.name+" has entered the chat room.", existing_users: users})
  	users.push({name: data.name, id: socket.id});
  	console.log(users);
  });

  socket.on("message_sent", function(data){
  	console.log(data.message);
  	console.log(socket.id);
    users.map(function(user){
      if(user.id == socket.id){
      console.log(user.name);
      name = user.name;  
        io.sockets.emit("message_received", {message: data.message, name: name});
       return;
      }
    });
  })
  //all the socket code goes in here!
  socket.on("thing", function(data){
  	console.log("thing");
  	console.log(data)
  	socket.emit('different_thing', {response: "different thing being emitted"});
  });
  socket.on("disconnect", function(){

  	console.log(socket.id+" someone has disconnected");
    users.map(function(user){
      if(user.id == socket.id){
      console.log(user.name);
      name = user.name;  
  	   socket.broadcast.emit("user_left", {message: name+ " has left the chat room"});
       return;
      }
    });
    for (var i=0; i<users.length; i++){
      var obj = users[i];
      if (users[i].id == socket.id){
        users.splice(i, 1);
      }
    }
  })
});