var net = require("net");
var server = net.createServer();

var sockets = [];
var _ip = "94.130.122.236";
var _port = 3010;

server.on('connection',function(socket){
	sockets.push(socket);
    sockets[i].write(JSON.stringify({
                        "notifText":"saeed"
                    })+"\n");  
});

server.listen(_port,_ip);
