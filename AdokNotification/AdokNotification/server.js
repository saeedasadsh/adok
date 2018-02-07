var net = require("net");
var http = require('http');

var server = net.createServer();
var StringDecoder = require('string_decoder').StringDecoder;

var _ip = "94.130.122.236";
var _port = 3010;

var Notifications=[];
var Players=[];
var delivery = [];

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
                        var CurNotifications = [];
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
                                var lastUpdateTime = dt[i].lastUpdateTime;
                                var IsStop = dt[i].IsStop;
                                var players = [];
                                var playersId = [];
                                

                                var NotiData = {
                                    id: id, appId: appId, title: title, message: message, url: url, timeToLive: timeToLive
                                    , dateStartSend: dateStartSend, timeStartSend: timeStartSend, sound: sound, smalIcon: smalIcon, largeIcon: largeIcon
                                    , bigPicture: bigPicture, ledColor: ledColor, accentColor: accentColor, gId: gId, priority: priority
                                    , pkgNameAndroid: pkgNameAndroid, pkgNameIos: pkgNameIos, kind: kind, lastUpdateTime: lastUpdateTime, AdditionalData: AdditionalData, btns: btns
                                };

                                var Deliverydt = { id: id, playersId: "" };
                                CurNotifications.push(NotiData);
                                var canAdd = 0;
                                if (id > 0) {
                                    for (var j = 0; j < Notifications.length; j++) {
                                        if (Notifications[j].id == id) {

                                            if (Notifications[j].lastUpdateTime < lastUpdateTime)
                                            {
                                                Notifications[j].appId = appId;
                                                Notifications[j].title = title;
                                                Notifications[j].message = message;
                                                Notifications[j].url = url;
                                                Notifications[j].timeToLive = timeToLive;
                                                Notifications[j].dateStartSend = dateStartSend;
                                                Notifications[j].timeStartSend = timeStartSend;
                                                Notifications[j].sound = sound;
                                                Notifications[j].smalIcon = smalIcon;
                                                Notifications[j].largeIcon = largeIcon;
                                                Notifications[j].bigPicture = bigPicture;
                                                Notifications[j].ledColor = ledColor;
                                                Notifications[j].accentColor = accentColor;
                                                Notifications[j].gId = gId;
                                                Notifications[j].priority = priority;
                                                Notifications[j].pkgNameAndroid = pkgNameAndroid;
                                                Notifications[j].pkgNameIos = pkgNameIos;
                                                Notifications[j].kind = kind;
                                                Notifications[j].lastUpdateTime = lastUpdateTime;
                                                Notifications[j].IsStop = IsStop;
                                            }
                                            canAdd = 1;
                                        }

                                        if (Notifications[j].IsStop > 0)
                                        {
                                            canAdd = 1;
                                        }
                                    }

                                    if (canAdd == 0) {
                                        console.log("added: " + NotiData.id);
                                        Notifications.push(NotiData);
                                        delivery.push(Deliverydt);
                                    }
                                }
                            }
                        }

                        var today = new Date();
                        var h = today.getHours();
                        var m = today.getMinutes();

                        var dat = h * 60 + m;
                        Notifications.forEach(function (item, index, object) {
                            if (item.IsStop>0) {
                                object.splice(index, 1);
                                console.log("stoped: " + item.id);
                            }
                        });

                        Notifications.forEach(function (item, index, object) {
                            var exsist = 0;
                            for (k = 0; k < CurNotifications.length; k++)
                            {
                                if (CurNotifications[k].id == item.id)
                                {
                                    exsist = 1;
                                }
                            }
                            if (exsist == 0)
                            {
                                object.splice(index, 1);
                                console.log("deleted beacuse not exsist: " + item.id);
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
                                console.log(Players[k].pkgName + " " + noti.pkgNameAndroid + " " + Players[k].pkgName + " " + noti.pkgNameIos);
                                if (Players[k].pkgName == noti.pkgNameAndroid || Players[k].pkgName == noti.pkgNameIos)
                                {
                                    Players[k].players.forEach(function (itemp, indexp, objectp) {
                                        if (itemp.socket == undefined) {
                                            objectp.splice(indexp, 1);
                                        }
                                        else
                                        {
                                            console.log(delivery[index].playersId.indexOf(":" + itemp.playerId + ":"));
                                            console.log(delivery[index].playersId);

                                            if (delivery[index].playersId.indexOf(":" + itemp.playerId + ":") < 0) {
                                                itemp.socket.write(JSON.stringify(noti) + "\n");
                                                console.log("send noti beacuse not delivered: " + itemp.playerId);
                                            }
                                            else
                                            {
                                                console.log("dont send noti beacuse delivered: " + itemp.playerId);
                                            }
                                            
                                        }
                                    });
                                    
                                }
                                
                            }

                        });
                    }
                    catch (e) {
                        console.log("1: "+e.message);
                    }
                });

            });

            req.write(qs);
            req.end();

        }, 10000);
    }
    catch (e) {
        console.log("2: " +e.message);
    }
})();

try {
    var decoder = new StringDecoder('utf8');
    server.on('connection', function (socket) {
        //console.log('CONNECTED: ' + socket.remoteAddress + ':' + socket.remotePort);

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
                            console.log("player added: " + playerId);
                            added = 1;
                        }
                    }

                    if (added == 0)
                    {
                        var dt = { pkgName: pkgName,players:[]};
                        Players.push(dt);
                        Players[Players.length - 1].players.push(myData);
                        console.log("player added with push: " + playerId);
                    }
                }
                else if (knd == "Alive")
                {                 
                    var data = {
                        alive: true, Meskind:"Alive"
                    };

                    socket.write(JSON.stringify(data) + "\n");
                }
                else if (knd == "Deliver") {
                    var nid = dt.nid;
                    for (i = 0; i < delivery.length; i++)
                    {
                        if (delivery[i].id == nid)
                        {
                            delivery[i].playersId += ":" + playerId + ":";
                        }
                    }
                }
            }
            catch (e) {
                console.log("3: " +e.message);
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
            console.log("4: " +e.message);
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
                console.log("5: " +e.message);
            }
        });

    });

    server.listen(_port, _ip);
}
catch (e) {
    console.log("6: " +e.message);
}
