var net = require("net");
var server = net.createServer();

var sockets = [];
var _ip = "94.130.122.236";
var _port = 3010;

console.log("server started");

server.on('connection',function(socket){
    console.log("Connected");
    
	sockets.push(socket);
    socket.write(JSON.stringify({
                        "notifText":"saeed"
                    })+"\n"); 
    
    
    socket.on('disconnect', function (data) {
        console.log("disconnected");
    });
    
    
});

server.listen(_port,_ip);
