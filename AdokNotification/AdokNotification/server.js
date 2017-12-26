var net = require("net");
var http = require('http');

var server = net.createServer();
var StringDecoder = require('string_decoder').StringDecoder;

var _ip = "94.130.122.236";
var _port = 3010;

var rooms = [];
console.log("server started");


(function () {

    try {
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

                    try {
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
                                var playersId = [];

                                var userData = {
                                    id: id, appId: appId, title: title, message: message, url: url, timeToLive: timeToLive
                                    , dateStartSend: dateStartSend, timeStartSend: timeStartSend, sound: sound, smalIcon: smalIcon, largeIcon: largeIcon
                                    , bigPicture: bigPicture, ledColor: ledColor, accentColor: accentColor, gId: gId, priority: priority
                                    , pkgNameAndroid: pkgNameAndroid, pkgNameIos: pkgNameIos, AdditionalData: AdditionalData, btns: btns, players: players, playersId: playersId
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

                        //console.log("sending notification to " + rooms.length + " apps");

                        rooms.forEach(function (item, index, object) {
                            var noti = {
                                id: item.id, appId: item.appId, title: item.title, message: item.message, url: item.url, timeToLive: item.timeToLive
                                , dateStartSend: item.dateStartSend, timeStartSend: item.timeStartSend, sound: item.sound, smalIcon: item.smalIcon, largeIcon: item.largeIcon
                                , bigPicture: item.bigPicture, ledColor: item.ledColor, accentColor: item.accentColor, gId: item.gId, priority: item.priority
                                , pkgNameAndroid: item.pkgNameAndroid, pkgNameIos: item.pkgNameIos, AdditionalData: item.AdditionalData, btns: item.btns
                            };


                            item.players.forEach(function (itemp, indexp, objectp) {
                                try {
                                    if (itemp != undefined) {
                                       // console.log('noti to: ' + itemp.remoteAddress + ':' + itemp.remotePort);
                                        itemp.write(JSON.stringify(noti) + "\n");
                                    }
                                }
                                catch (e) {
                                    console.log("error 1 " + e);
                                    objectp.splice(indexp, 1);
                                }
                            });

                        });
                    }
                    catch (e) {
                        console.log("error 2 " + e);
                    }
                });

            });

            req.write(qs);
            req.end();

        }, 10000);
    }
    catch (e) {
        //delete sockets[i];
        console.log("error 5 " + e);
    }
})();

try {
    var decoder = new StringDecoder('utf8');
    server.on('connection', function (socket) {
        //console.log("Connected");
        //console.log('CONNECTED: ' + socket.remoteAddress + ':' + socket.remotePort);
        socket.on('data', function (data) {

            try {
                var dt = JSON.parse(data);
                var playerId = dt.playerId;
                var pkgName = dt.pkgName;
                var phoneNo = dt.phoneNo;

                var added = 0;

                rooms.forEach(function (item, index, object) {
                    if (item.pkgNameAndroid == pkgName) {
                        item.playersId.forEach(function (itemp, indexp, objectp) {
                            if (itemp == playerId) {
                                delete item.players[indexp];
                                item.players.splice(indexp, 1);
                                item.playersId.splice(indexp, 1);
                            }
                        });
                    }
                    else {
                        if (item.pkgNameIos == pkgName) {
                            item.playersId.forEach(function (itemp, indexp, objectp) {
                                if (itemp == playerId) {
                                    item.players.destroy();
                                    item.players.splice(indexp, 1);
                                    item.playersId.splice(indexp, 1);
                                }
                            });
                        }
                    }
                });


                for (var i = 0; i < rooms.length; i++) {
                    if (rooms.pkgNameAndroid != "") {
                        if (rooms[i].pkgNameAndroid == pkgName) {
                            rooms[i].players.push(socket);
                            rooms[i].playersId.push(playerId);
                        }
                    }
                    else {
                        if (rooms[i].pkgNameIos == pkgName) {
                            rooms[i].players.push(socket);
                            rooms[i].playersId.push(playerId);
                        }
                    }
                }
            }
            catch (e) {
                //delete sockets[i];
                console.log("error 3 " + e);
            }

        });

        socket.on('close', function (data) {
            //console.log('CLOSED: ' + socket.remoteAddress + ' ' + socket.remotePort);
            try {
                for (var i = 0; i < rooms.length; i++) {
                    rooms[i].players.forEach(function (item, index, object) {
                        if (item == undefined) {
                            item.destroy();
                            object.splice(index, 1);
                        }
                    });
                }
            }
            catch (e) {
                //delete sockets[i];
                console.log("error 4 " + e);
            }
        });

        socket.on('disconnect', function (data) {
            console.log('disconnect: ' + data);
        });


        socket.on('error', function (data) {
            console.log('error: ' + data);
            try {
                for (var i = 0; i < rooms.length; i++) {
                    rooms[i].players.forEach(function (item, index, object) {
                        if (item == undefined) {
                            item.destroy();
                            object.splice(index, 1);
                        }
                    });
                }
            }
            catch (e) {
                //delete sockets[i];
                console.log("error 4 " + e);
            }
        });

    });

    server.listen(_port, _ip);
}
catch (e) {
    //delete sockets[i];
    console.log("error 6 " + e);
}