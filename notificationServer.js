var net = require("net");
var http = require('http');
var server = net.createServer();

var sockets = [];
var _ip = "94.130.122.236";
var _port = 3010;

console.log("server started");


var options = {
    hostname: "ashabrasaneh.ir",
    port: 80,
    path: "/GamesData/ADok/GetNotifications.php",
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': qslength
    }
};

var buffer = "";
var req = http.request(options, function (res) {
    res.on('data', function (chunk) {
        buffer += chunk;
    });
    res.on('end', function () {

        /*
        var dt = JSON.parse(buffer);
        for (var i = 0; i < dt.length; i++) {
            var id = dt[i].id;
            var appId = dt[i].appId;
            var title = dt[i].title;
            var message = dt[i].message;
            var url = dt[i].url;
            var timeToLive = dt[i].timeToLive;
            var dateStartSend = dt[i].dateStartSend;
            var timeStartSend = dt[i].timeStartSend;
            var sound = dt[i].sound;
            var smalIcon = dt[i].smalIcon;
            var largeIcon = dt[i].largeIcon;
            var bigPicture = dt[i].bigPicture;
            var ledColor = dt[i].ledColor;
            var accentColor = dt[i].accentColor;
            var gId = dt[i].gId;
            var priority = dt[i].priority;
            var pkgNameAndroid = dt[i].pkgNameAndroid;
            var pkgNameIos = dt[i].pkgNameIos;
            var AdditionalData = dt[i].AdditionalData;
            var btns = dt[i].btns;
            
            
            
            
            }

        }
        */
        console.log("Leagues Added---ready for Play");
    });
});

req.write(qs);
req.end();

/*
(function () {
    var c = 0;
    var timeout = setInterval(function () {
        
        var options = {
            hostname: "ashabrasaneh.ir",
            port: 80,
            path: "/GamesData/Hads/GetLeaguesForNjs.php",
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': qslength
            }
        };

        var buffer = "";
        var req = http.request(options, function (res) {
            res.on('data', function (chunk) {
                buffer += chunk;
            });
            res.on('end', function () {
                
                var dt = JSON.parse(buffer);
                for (var i = 0; i < dt.length; i++) {
                    var lId = dt[i].leagueId;
                    var mP = dt[i].maxPlayer;
                    var plc = dt[i].playerCount;
                    var canAdd = 1;
                    for (var j = 0; j < leagues.length; j++) {
                        if (leagues[j] == lId) {
                            canAdd = 0;
                        }
                    }
                    if (canAdd == 1) {
                        leagues.push(lId);
                        LeaguePlayerCountMax.push(mP);
                        LeaguePlayerCount.push(plc);
                        leaguesPlayersArr.push([]);
                        leaguesPlayersNameArr.push([]);
                        leaguesPlayersAvatarArr.push([]);
                        leagueSocksArr.push([]);
                    }

                }
                console.log("Leagues Added---ready for Play");
            });
        });

        req.write(qs);
        req.end();
        //
    }, 10000);
})();
*/
server.on('connection',function(socket){
    console.log("Connected");
    
	sockets.push(socket);
    socket.write(JSON.stringify({
                        "notifText":"saeed"
                    })+"\n"); 
    
    socket.on('data', function (data) {
        console.log(data);
        socket.write("hi");       
    });
    
    socket.on('disconnect', function (data) {
        console.log("disconnected");
    });
    
    
});

server.listen(_port,_ip);
