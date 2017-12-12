var server = require('http').Server();
var io = require('socket.io')(server);

io.on('connection', function(socket){
    console.log("connected");
    
  socket.on('foo', function(data){
    console.log("Received message : "+data);
    //socket.emit("message","echoing back : "+data);
  });
    
  socket.on('disconnect', function(){
    console.log("disconnected");
   });
});
server.listen(3010,"94.130.122.236");
