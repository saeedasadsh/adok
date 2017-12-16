var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser')
app.use(bodyParser.json());

app.post('http://ashabrasaneh.ir/GamesData/ADok/addNotification.php/phpcallback', function(req, res) {
    var content = req.body;
    console.log('message received from php: ' + content.msg);
    //to-do: forward the message to the connected nodes.
    res.end('ok');
});

http.listen(3010, function(){
  var addr = http.address();
  console.log('app listening on ' + addr.address + ':' + addr.port);
});
