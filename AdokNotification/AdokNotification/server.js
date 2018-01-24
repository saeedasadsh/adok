var net = require("net");
var http = require('http');

var server = net.createServer();
var StringDecoder = require('string_decoder').StringDecoder;

var _ip = "94.130.122.236";
var _port = 3010;

var Notifications=[];

var Players=[];

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
                                var kind = dt[i].kind;
                                var AdditionalData = dt[i].AdditionalData;
                                var btns = dt[i].btns;
                                var players = [];
                                var playersId = [];

                                var NotiData = {
                                    id: id, appId: appId, title: title, message: message, url: url, timeToLive: timeToLive
                                    , dateStartSend: dateStartSend, timeStartSend: timeStartSend, sound: sound, smalIcon: smalIcon, largeIcon: largeIcon
                                    , bigPicture: bigPicture, ledColor: ledColor, accentColor: accentColor, gId: gId, priority: priority
                                    , pkgNameAndroid: pkgNameAndroid, pkgNameIos: pkgNameIos, kind: kind, AdditionalData: AdditionalData, btns: btns
                                };

                                var canAdd = 0;
                                if (id > 0) {
                                    for (var j = 0; j < Notifications.length; j++) {
                                        if (Notifications[j].id == id) {
                                            canAdd = 1;
                                        }
                                    }

                                    if (canAdd == 0) {
                                        Notifications.push(NotiData);
                                    }
                                }
                            }
                        }

                        var today = new Date();
                        var h = today.getHours();
                        var m = today.getMinutes();

                        var dat = h * 60 + m;

                        Notifications.forEach(function (item, index, object) {
                            if (item.timeStartSend + item.timeToLive < dat) {
                                object.splice(index, 1);
                            }
                        });

                        for (var k = 0; k < Players.length; k++)
                        {
                            Players[k].players.forEach(function (item, index, object) {
                                if (item.socket == undefined)
                                {
                                    object.splice(index, 1);
                                }
                            });
                        }

                        Notifications.forEach(function (item, index, object) {
                            var noti = {
                                id: item.id, appId: item.appId, title: item.title, message: item.message, url: item.url, timeToLive: item.timeToLive
                                , dateStartSend: item.dateStartSend, timeStartSend: item.timeStartSend, sound: item.sound, smalIcon: item.smalIcon, largeIcon: item.largeIcon
                                , bigPicture: item.bigPicture, ledColor: item.ledColor, accentColor: item.accentColor, gId: item.gId, priority: item.priority
                                , pkgNameAndroid: item.pkgNameAndroid, pkgNameIos: item.pkgNameIos, kind: item.kind,AdditionalData: item.AdditionalData, btns: item.btns,Meskind:"noti"
                            };

                            for (var k = 0; k < Players.length; k++)
                            {
                                if (Players[k].pkgName == noti.pkgNameAndroid || Players[k].pkgName == noti.pkgNameIos)
                                {
                                    Players[k].players.forEach(function (itemp, indexp, objectp) {
                                        if (itemp.socket == undefined) {
                                            objectp.splice(indexp, 1);
                                        }
                                        else
                                        {
                                            itemp.socket.write(JSON.stringify(noti) + "\n");
                                        }
                                    });
                                    
                                }
                            }

                        });
                    }
                    catch (e) {
                    }
                });

            });

            req.write(qs);
            req.end();

        }, 10000);
    }
    catch (e) {
    }
})();

try {
    var decoder = new StringDecoder('utf8');
    server.on('connection', function (socket) {
        console.log('CONNECTED: ' + socket.remoteAddress + ':' + socket.remotePort);

        socket.on('data', function (data) {

            try {

                if (data && data.byteLength != undefined) {
                    data = new Buffer(data).toString('utf8');
                }

                var dt = JSON.parse(data);
                var playerId = dt.playerId;
                var pkgName = dt.pkgName;
                var phoneNo = dt.phoneNo;
                var knd = dt.kind;
                var added = 0;

                var myData = {
                    playerId: playerId, phoneNo: phoneNo, socket: socket
                };

                if (knd == "add") {
                    for (var i = 0; i < Players.length; i++) {
                        if (Players[i].pkgName == pkgName || Players[i].pkgName == pkgName) {
                            Players[i].players.push(myData);

                            console.log("player Added");
                            console.log(Players[i]);
                            added = 1;
                        }
                    }

                    if (added == 0)
                    {
                        var dt = { pkgName: pkgName,players:[]};
                        Players.push(dt);
                        Players[Players.length - 1].players.push(myData);

                        console.log("player Added here");
                        console.log(Players[Players.length - 1].players);

                    }
                }
                else if (knd == "Alive")
                {                 
                    var data = {
                        alive: true, Meskind:"Alive"
                    };

                    socket.write(JSON.stringify(data) + "\n");
                }
            }
            catch (e) {
                }
            

        });

        socket.on('close', function (data) {
        try {
            for (var k = 0; k < Players.length; k++) {
                Players[k].players.forEach(function (item, index, object) {
                        if (item.socket == undefined) {
                            object.splice(index, 1);
                        }
                    });
                }
            }
            catch (e) {
            }
        });

        socket.on('disconnect', function (data) {
        });


        socket.on('error', function (data) {
            delete socket;
            try {
                for (var k = 0; k < Players.length; k++) {
                    Players[k].players.forEach(function (item, index, object) {
                        if (item.socket == undefined) {
                            object.splice(index, 1);
                        }
                    });
                }
            }
            catch (e) {
            }
        });

    });

    server.listen(_port, _ip);
}
catch (e) {
}