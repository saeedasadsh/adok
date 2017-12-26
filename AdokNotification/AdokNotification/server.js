var net = require("net");
var http = require('http');
var server = net.createServer();
var StringDecoder = require('string_decoder').StringDecoder;

var _ip = "94.130.122.236";
var _port = 3010;

var rooms = [];
console.log("server started");


(function () {
    var c = 0;
    var timeout = setInterval(function () {

        var dataQS = {
            var1: "something",
            var2: "something else"
        };

        var querystring = require("querystring");
        var qs = querystring.stringify(dataQS);
        var qslength = qs.length;

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


                var dt = JSON.parse(buffer);
                //console.log(dt);
                for (var i = 0; i < dt.length; i++) {
                    var id = dt[i].id;
                    if (id != -1) {
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
                        var players = [];
                        var userData = {
                            id: id, appId: appId, title: title, message: message, url: url, timeToLive: timeToLive
                            , dateStartSend: dateStartSend, timeStartSend: timeStartSend, sound: sound, smalIcon: smalIcon, largeIcon: largeIcon
                            , bigPicture: bigPicture, ledColor: ledColor, accentColor: accentColor, gId: gId, priority: priority
                            , pkgNameAndroid: pkgNameAndroid, pkgNameIos: pkgNameIos, AdditionalData: AdditionalData, btns: btns, players: players
                        };

                        var canAdd = 0;
                        if (id > 0) {
                            for (var i = 0; i < rooms.length; i++) {
                                if (rooms[i].id == id) {
                                    canAdd = 1;
                                }
                            }
                            if (canAdd == 0) {
                                rooms.push(userData);
                                console.log("rooms added- rooms count:" + rooms.length);
                            }
                        }
                    }
                }

                var today = new Date();
                var h = today.getHours();
                var m = today.getMinutes();

                var dat = h * 60 + m;

                rooms.forEach(function (item, index, object) {
                    if (item.timeStartSend + item.timeToLive < dat) {
                        object.splice(index, 1);
                    }
                });

                console.log("sending notification to " + rooms.length + " apps");

                rooms.forEach(function (item, index, object) {
                    var noti = {
                        id: item.id, appId: item.appId, title: item.title, message: item.message, url: item.url, timeToLive: item.timeToLive
                        , dateStartSend: item.dateStartSend, timeStartSend: item.timeStartSend, sound: item.sound, smalIcon: item.smalIcon, largeIcon: item.largeIcon
                        , bigPicture: item.bigPicture, ledColor: item.ledColor, accentColor: item.accentColor, gId: item.gId, priority: item.priority
                        , pkgNameAndroid: item.pkgNameAndroid, pkgNameIos: item.pkgNameIos, AdditionalData: item.AdditionalData, btns: item.btns
                    };

                    item.players.forEach(function (itemp, indexp, objectp) {
                        itemp.write(JSON.stringify(noti) + "\n");
                    });

                });
                /*
                for (var i = 0; i < rooms.length; i++) {
                    var noti = {
                        id: rooms[i].id, appId: rooms[i].appId, title: rooms[i].title, message: rooms[i].message, url: rooms[i].url, timeToLive: rooms[i].timeToLive
                        , dateStartSend: rooms[i].dateStartSend, timeStartSend: rooms[i].timeStartSend, sound: rooms[i].sound, smalIcon: rooms[i].smalIcon, largeIcon: rooms[i].largeIcon
                        , bigPicture: rooms[i].bigPicture, ledColor: rooms[i].ledColor, accentColor: rooms[i].accentColor, gId: rooms[i].gId, priority: rooms[i].priority
                        , pkgNameAndroid: rooms[i].pkgNameAndroid, pkgNameIos: rooms[i].pkgNameIos, AdditionalData: rooms[i].AdditionalData, btns: rooms[i].btns
                    };

                    for (var j = 0; j < rooms[i].players.length; j++) {
                        if (!rooms[i].players[j].connected) {
                            rooms[i].players.splice(j, 1);
                        }
                        else {
                            rooms[i].players[j].write(JSON.stringify(noti) + "\n");
                        }

                    }
                }
                */
            });

        });

        req.write(qs);
        req.end();

    }, 10000);
})();

var decoder = new StringDecoder('utf8');
server.on('connection', function (socket) {
    console.log("Connected");
    console.log('CONNECTED: ' + socket.remoteAddress + ':' + socket.remotePort);
    socket.on('data', function (data) {

        var dt = JSON.parse(data);
        var playerId = dt.playerId;
        var pkgName = dt.pkgName;
        var phoneNo = dt.phoneNo;

        for (var i = 0; i < rooms.length; i++) {
            if (rooms.pkgNameAndroid != "") {
                if (rooms[i].pkgNameAndroid == pkgName) {
                    rooms[i].players.push(socket);
                }
            }
            else {
                if (rooms[i].pkgNameIos == pkgName) {
                    rooms[i].players.push(socket);
                }
            }
        }
    });

    socket.on('close', function (data) {
        console.log('CLOSED: ' + socket.remoteAddress + ' ' + socket.remotePort);
        for (var i = 0; i < rooms.length; i++) {
            rooms[i].players.forEach(function (item, index, object) {
                if (item.socket.remoteAddress == socket.remoteAddress && item.socket.remotePort == socket.remotePort) {
                    object.splice(index, 1);
                }
            });
        }
    });
});

server.listen(_port, _ip);