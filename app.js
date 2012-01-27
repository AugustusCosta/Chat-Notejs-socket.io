var app = require('express').createServer()
var io = require('socket.io').listen(app);

app.listen(8080);

// routing
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

// usernames which are currently connected to the chat
var usernames = {};

io.sockets.on('connection', function (socket) {

  // when the client emits 'sendchat', this listens and executes
  socket.on('sendchat', function (data) {
    // we tell the client to execute 'updatechat' with 2 parameters
    var menssagem = {'username':socket.username, 'data':data.menssagem}
    io.sockets.emit('updatechat', menssagem);
  });

  // when the client emits 'adduser', this listens and executes
  socket.on('adduser', function(data){
	username = data.username
    // we store the username in the socket session for this client
    socket.username = username;
    // add the client's username to the global list
    usernames[username] = username;
    // echo to client they've connected
    socket.emit('updatechat', {"username":"SERVER","data":'you have connected'});
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('updatechat', {"username":"SERVER","data":username + ' has connected'});
    // update the list of users in chat, client-side
    io.sockets.emit('updateusers', usernames);
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function(){
    // remove the username from global usernames list
    delete usernames[socket.username];
    // update list of users in chat, client-side
    io.sockets.emit('updateusers', usernames);
    // echo globally that this client has left
    socket.broadcast.emit('updatechat', {"username":"SERVER","data":socket.username + ' has disconnected'});
  });
});
