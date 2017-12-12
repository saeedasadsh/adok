var io = require('socket.io')(process.env.PORT || 3010);
var http = require('http');
console.log('server started');

// usernames which are currently connected to the chat
var usernames = {};

// rooms which are currently available in chat
var rooms = [];

io.sockets.on('connection', function (socket) {

    console.log('connected');
	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', function(username,pkgName){
		// store the username in the socket session for this client
		socket.username = username;
		// store the room name in the socket session for this client
		socket.room = pkgName;
		// add the client's username to the global list
		usernames[username] = username;
		// send client to room 1
		socket.join(pkgName);
		// echo to client they've connected
		socket.emit('JoinedRoom', 'SERVER', 'you have connected to '+pkgName);
		// echo to room 1 that a person has connected to their room
		//socket.broadcast.to('room1').emit('updatechat', 'SERVER', username + ' has connected to this room');
		//socket.emit('updaterooms', rooms, 'room1');
	});

	// when the client emits 'sendchat', this listens and executes
	/*socket.on('sendchat', function (data) {
		// we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.in(socket.room).emit('updatechat', socket.username, data);
	});

	socket.on('switchRoom', function(newroom){
		// leave the current room (stored in session)
		socket.leave(socket.room);
		// join new room, received as function parameter
		socket.join(newroom);
		socket.emit('updatechat', 'SERVER', 'you have connected to '+ newroom);
		// sent message to OLD room
		socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
		// update socket session room title
		socket.room = newroom;
		socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');
		socket.emit('updaterooms', rooms, newroom);
	});
*/
	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
        console.log('disconnected');
		// remove the username from global usernames list
		//delete usernames[socket.username];
		// update list of users in chat, client-side
		//io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		//socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
		//socket.leave(socket.room);
	});
});

