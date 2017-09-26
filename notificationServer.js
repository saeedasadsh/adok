var server = require('http').createServer();;
var io = require('socket.io')(server);
server.listen(3001);

console.log('server started');

var socks = [];

io.on('connection', function (socket) {
    socks.push(socket);
    console.log('client coneccted, id: ', socket);
    socket.emit('connectToServer', { id:"me"});
    
    socket.on("tellType", function (data) {
        
    });
    
    socket.on('disconnect', function (data) {
        console.log('client disconnect,',data);
    });
});

