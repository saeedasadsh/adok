var net = require("net");
var http = require('http');
var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "kingofmeta_adok",
    password: "NTGePf_Pnn%N",
    database: "kingofmeta_ADok"
});

con.connect((err) => {
    if (err) {
        console.log('Error connecting to Db');
        return;
    }
    console.log('Connection established');
});

con.end((err) => {
    // The connection is terminated gracefully
    // Ensures all previously enqueued queries are still
    // before sending a COM_QUIT packet to the MySQL server.
    console.log('Connection closed');
});



var server = net.createServer();
var StringDecoder = require('string_decoder').StringDecoder;

//var _ip = "94.130.122.236";
var _ip = "188.253.2.147";

var _port = 3010;

var Notifications = [];
var Players = [];
var delivery = [];
var testNoti = [];

(function () {

    try {
        //var c = 0;
        var timeout = setInterval(function () {

            GetNotifications();

        }, 10000);
    }
    catch (e) {
        console.log("2: " + e.message);
    }
})();

try {
    var decoder = new StringDecoder('utf8');
    server.on('connection', function (socket) {
        console.log('CONNECTED: ' + socket.remoteAddress + ':' + socket.remotePort);
        var myId = -1;
        var pkgs = [];
        socket.on('data', function (data) {

            try {

                if (data && data.byteLength != undefined) {
                    data = new Buffer(data).toString('utf8');
                }
                //console.log('data: ' + data);

                var dt = JSON.parse(data);
                var playerId = dt.playerId;
                var pkgName = dt.pkgName;
                var phoneNo = dt.phoneNo;
                pkgs = dt.pkgs;
                var knd = dt.kind;
                var added = 0;
                myId = playerId;
                var myData = {
                    playerId: playerId, phoneNo: phoneNo, socket: socket, pkgs: pkgs, alive: 0
                };
                var d = new Date();
                var n = d.getTime();
                myData.alive = n;

                if (knd == "add") {

                    if (pkgs != undefined) {
                        for (var j = 0; j < pkgs.length; j++) {
                            if (Players[pkgs[j]] === undefined) {
                                Players[pkgs[j]] = { players:[]};
                                Players[pkgs[j]].players[playerId] = myData;
                            }
                            else {
                                Players[pkgs[j]].players[playerId] = myData;
                            }
                        }

                        PlayerConnected(playerId, pkgs);
                    }
                }

                else if (knd == "Alive") {
                    var data = {
                        alive: true, Meskind: "Alive"
                    };
                    for (var j = 0; j < pkgs.length; j++) {
                        if (Players[pkgs[j]] != undefined) {
                            if (Players[pkgs[j]].players[playerId] != undefined) {
                                var d = new Date();
                                var n = d.getTime();
                                var res = n - Players[pkgs[j]].players[playerId].alive;
                                //console.log("Alive: " + res);
                                Players[pkgs[j]].players[playerId].alive = n;
                            }
                        }
                    }
                    socket.write(JSON.stringify(data) + "\n");
                }
                else if (knd == "Deliver") {
                    console.log("Delivered: " + playerId);
                    var nid = dt.nid;
                    if (delivery[nid] != undefined) {
                        delivery[nid].playersId += ":" + playerId + ":";
                    }
                }
            }
            catch (e) {
                console.log("3: " + e.message);
            }
        });

        socket.on('close', function (data) {
            try {
                for (var j = 0; j < pkgs.length; j++) {
                    if (Players[pkgs[j]] != undefined) {
                        if (Players[pkgs[j]].players[myId] != undefined) {
                            delete Players[pkgs[j]].players[myId];
                        }
                    }
                }
            }
            catch (e) {
                console.log("4: " + e.message);
            }
        });

        socket.on('disconnect', function (data) {
        });


        socket.on('error', function (data) {
            try {
                for (var j = 0; j < pkgs.length; j++) {
                    if (Players[pkgs[j]] != undefined) {
                        if (Players[pkgs[j]].players[myId] != undefined) {
                            delete Players[pkgs[j]].players[myId];
                        }
                    }
                }
            }
            catch (e) {
                console.log("5: " + e.message);
            }
        });

    });

    server.listen(_port, _ip);
}
catch (e) {
    console.log("6: " + e.message);
}

function PlayerConnected(pid,pkgs) {

    var dataQS = {
        var1: "something",
        var2: "something else"
    };

    var querystring = require("querystring");
    var qs = querystring.stringify(dataQS);
    var qslength = qs.length;

    var options = {
        hostname: "adok.ir",
        port: 80,
        path: "/GamesData/ADok/PlayerConnected.php?playerId=" + pid + "&pkgs=" + pkgs,
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
            console.log("PlayerConnected " + pid +" : "+ buffer);
        });
    });

    req.write(qs);
    req.end();
}

function PlayerDisonnected(pid) {

    var dataQS = {
        var1: "something",
        var2: "something else"
    };

    var querystring = require("querystring");
    var qs = querystring.stringify(dataQS);
    var qslength = qs.length;

    var options = {
        hostname: "adok.ir",
        port: 80,
        path: "/GamesData/ADok/PlayerDisconnected.php?playerId=" + pid,
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
            console.log("PlayerDisconnected" + pid +" : "+ buffer);
        });
    });
    req.write(qs);
    req.end();
}

//function GetNotifications() {

    
//    var dataQS = {
//        var1: "something",
//        var2: "something else"
//    };

//    var querystring = require("querystring");
//    var qs = querystring.stringify(dataQS);
//    var qslength = qs.length;

//    var options = {
//        hostname: "adok.ir",
//        port: 80,
//        path: "/GamesData/ADok/GetNotifications.php",
//        method: 'POST',
//        headers: {
//            'Content-Type': 'application/x-www-form-urlencoded',
//            'Content-Length': qslength
//        }
//    };

//    var buffer = "";
//    var req = http.request(options, function (res) {
//        res.on('data', function (chunk) {
//            buffer += chunk;
//        });

//        res.on('end', function () {

//            try {
//                //console.log(buffer);

//                var d = new Date();
//                var n = d.getTime();

//                for (var eachItem in Players) {
//                    for (var eachPlayer in Players[eachItem].players) {
//                        var player = Players[eachItem].players[eachPlayer];
//                        var dif = n - player.alive;
//                        if (dif > 150000) {
//                            PlayerDisonnected(player.playerId);
//                            delete Players[eachItem].players[eachPlayer];
//                        }
//                    }
//                }



//                var dt = JSON.parse(buffer);
//                var CurNotifications = [];
//                for (var i = 0; i < dt.length; i++) {
//                    var id = dt[i].id;
//                    if (id != -1) {
//                        var appId = dt[i].appId;
//                        var title = dt[i].title;
//                        var message = dt[i].message;
//                        var url = dt[i].url;
//                        var timeToLive = dt[i].timeToLive;
//                        var dateStartSend = dt[i].dateStartSend;
//                        var timeStartSend = dt[i].timeStartSend;
//                        var sound = dt[i].sound;
//                        var smalIcon = dt[i].smalIcon;
//                        var largeIcon = dt[i].largeIcon;
//                        var bigPicture = dt[i].bigPicture;
//                        var ledColor = dt[i].ledColor;
//                        var accentColor = dt[i].accentColor;
//                        var gId = dt[i].gId;
//                        var priority = dt[i].priority;
//                        var pkgNameAndroid = dt[i].pkgNameAndroid;
//                        var pkgNameIos = dt[i].pkgNameIos;
//                        var kind = dt[i].kind;
//                        var AdditionalData = dt[i].AdditionalData;
//                        var btns = dt[i].btns;
//                        var lastUpdateTime = dt[i].lastUpdateTime;
//                        var IsStop = dt[i].IsStop;
//                        var bigText = dt[i].bigText;
//                        var summary = dt[i].summary;
//                        var isTest = dt[i].isTest;
//                        var testId = dt[i].playerId;
//                        var players = [];
//                        var playersId = [];


//                        var NotiData = {
//                            id: id, appId: appId, title: title, message: message, url: url, timeToLive: timeToLive
//                            , dateStartSend: dateStartSend, timeStartSend: timeStartSend, sound: sound, smalIcon: smalIcon, largeIcon: largeIcon
//                            , bigPicture: bigPicture, ledColor: ledColor, accentColor: accentColor, gId: gId, priority: priority
//                            , pkgNameAndroid: pkgNameAndroid, pkgNameIos: pkgNameIos, kind: kind, lastUpdateTime: lastUpdateTime,
//                            bigText: bigText, summary: summary, AdditionalData: AdditionalData, btns: btns, isTest: isTest, testId: testId
//                        };


//                        if (isTest > 0) {
//                            testNoti.push(NotiData);
//                        }
//                        else {
//                            var Deliverydt = { id: id, playersId: "" };
//                            CurNotifications.push(NotiData);
//                            var canAdd = 0;
//                            if (id > 0) {
//                                if (Notifications[id] != undefined) {
//                                    if (Notifications[id].lastUpdateTime != lastUpdateTime) {
//                                        Notifications[id].appId = appId;
//                                        Notifications[id].title = title;
//                                        Notifications[id].message = message;
//                                        Notifications[id].url = url;
//                                        Notifications[id].timeToLive = timeToLive;
//                                        Notifications[id].dateStartSend = dateStartSend;
//                                        Notifications[id].timeStartSend = timeStartSend;
//                                        Notifications[id].sound = sound;
//                                        Notifications[id].smalIcon = smalIcon;
//                                        Notifications[id].largeIcon = largeIcon;
//                                        Notifications[id].bigPicture = bigPicture;
//                                        Notifications[id].ledColor = ledColor;
//                                        Notifications[id].accentColor = accentColor;
//                                        Notifications[id].gId = gId;
//                                        Notifications[id].priority = priority;
//                                        Notifications[id].pkgNameAndroid = pkgNameAndroid;
//                                        Notifications[id].pkgNameIos = pkgNameIos;
//                                        Notifications[id].kind = kind;
//                                        Notifications[id].lastUpdateTime = lastUpdateTime;
//                                        Notifications[id].IsStop = IsStop;
//                                        Notifications[id].bigText = bigText;
//                                        Notifications[id].summary = summary;
//                                    }
//                                }
//                                else
//                                {
//                                    console.log("added: " + NotiData.id);
//                                    //console.log();
//                                    Notifications[id]=NotiData;
//                                    delivery[id]=Deliverydt;
//                                }
//                            }
//                        }
//                    }
//                }

//                var today = new Date();
//                var h = today.getHours();
//                var m = today.getMinutes();

//                var dat = h * 60 + m;
//                for (var l in Notifications)
//                {
//                    var exsist = 0;
//                    for (k = 0; k < CurNotifications.length; k++) {
//                        if (CurNotifications[k].id == Notifications[l].id) {
//                            exsist = 1;
//                        }
//                    }

//                    if (exsist == 0) {
//                        delete Notifications[l];
//                        delete delivery[l];
//                        console.log("deleted beacuse not exsist: " + Notifications[l].id);
//                    }
//                    else if (Notifications[l].IsStop > 0) {
//                        delete Notifications[l];
//                        delete delivery[l];
//                        console.log("deleted beacuse not Stop: " + Notifications[l].id);
//                    }
                    
//                }

//                for (var l in Notifications) {
//                    var noti = {
//                        id: Notifications[l].id, appId: Notifications[l].appId, title: Notifications[l].title, message: Notifications[l].message, url: Notifications[l].url, timeToLive: Notifications[l].timeToLive
//                        , dateStartSend: Notifications[l].dateStartSend, timeStartSend: Notifications[l].timeStartSend, sound: Notifications[l].sound, smalIcon: Notifications[l].smalIcon, largeIcon: Notifications[l].largeIcon
//                        , bigPicture: Notifications[l].bigPicture, ledColor: Notifications[l].ledColor, accentColor: Notifications[l].accentColor, gId: Notifications[l].gId, priority: Notifications[l].priority
//                        , pkgNameAndroid: Notifications[l].pkgNameAndroid, pkgNameIos: Notifications[l].pkgNameIos, kind: Notifications[l].kind,
//                        bigText: Notifications[l].bigText, summary: Notifications[l].summary, AdditionalData: Notifications[l].AdditionalData, btns: Notifications[l].btns, Meskind: "noti"
//                    };

//                    if (Players[pkgNameAndroid] != undefined) {
//                        Players[pkgNameAndroid].players.forEach(function (itemp, indexp, objectp) {
//                            if (itemp.socket == undefined) {
//                                objectp.splice(indexp, 1);
//                            }
//                            else {
//                                if (delivery[Notifications[l].id].playersId.indexOf(":" + itemp.playerId + ":") < 0) {
//                                    itemp.socket.write(JSON.stringify(noti) + "\n");
//                                    console.log("send noti beacuse not delivered: " + itemp.playerId);
//                                }
//                                else {
//                                    console.log("dont send noti beacuse delivered: " + itemp.playerId);
//                                }

//                                if (n - itemp.alive > 300000) {
//                                    PlayerDisonnected(itemp.playerId);
//                                    objectp.splice(indexp, 1);
//                                }
//                            }
//                        });
//                    }

//                    if (Players[pkgNameIos] != undefined) {
//                        Players[pkgNameIos].players.forEach(function (itemp, indexp, objectp) {
//                            if (itemp.socket == undefined) {
//                                objectp.splice(indexp, 1);
//                            }
//                            else {
//                                if (delivery[Notifications[l].id].playersId.indexOf(":" + itemp.playerId + ":") < 0) {
//                                    itemp.socket.write(JSON.stringify(noti) + "\n");
//                                    console.log("send noti beacuse not delivered: " + itemp.playerId);
//                                }
//                                else {
//                                    console.log("dont send noti beacuse delivered: " + itemp.playerId);
//                                }

//                                if (n - itemp.alive > 300000) {
//                                    PlayerDisonnected(itemp.playerId);
//                                    objectp.splice(indexp, 1);
//                                }
//                            }
//                        });
//                    }
//                }

//                testNoti.forEach(function (item, index, object) {
//                    var noti = {
//                        id: item.id, appId: item.appId, title: item.title, message: item.message, url: item.url, timeToLive: item.timeToLive
//                        , dateStartSend: item.dateStartSend, timeStartSend: item.timeStartSend, sound: item.sound, smalIcon: item.smalIcon, largeIcon: item.largeIcon
//                        , bigPicture: item.bigPicture, ledColor: item.ledColor, accentColor: item.accentColor, gId: item.gId, priority: item.priority
//                        , pkgNameAndroid: item.pkgNameAndroid, pkgNameIos: item.pkgNameIos, kind: item.kind,
//                        bigText: item.bigText, summary: item.summary, AdditionalData: item.AdditionalData, btns: item.btns, Meskind: "noti"
//                    };

//                    var testId = item.testId;

//                    if (pkgNameAndroid != "") {
//                        if (Players[pkgNameAndroid] != undefined) {
//                            if (Players[pkgNameAndroid].players[testId] != undefined) {
//                                Players[pkgNameAndroid].players[testId].socket.write(JSON.stringify(noti) + "\n");
//                                object.splice(index, 1);
//                            }
//                        }
//                    }

//                    if (pkgNameIos != "") {
//                        if (Players[pkgNameIos] != undefined) {
//                            if (Players[pkgNameIos].players[testId] != undefined) {
//                                Players[pkgNameIos].players[testId].socket.write(JSON.stringify(noti) + "\n");
//                                object.splice(index, 1);
//                            }
//                        }
//                    }

//                });
//            }
//            catch (e) {
//                console.log("1: " + e.message);
//            }
//        });

//    });

//    req.write(qs);
//    req.end();
//}





function GetNotifications() {
    

        var d = new Date();
        var y = d.getFullYear();
        var m = d.getMonth();
        m++;
        var day = d.getDate();
        console.log(y + "/" + m + "/" + day);
        var dateHijri = gregorian_to_jalali(y, m, day);
        console.log(dateHijri);
        y = dateHijri[0];
        m = dateHijri[1];
        day = dateHijri[2];

        if (m.length == 1)
        {
            m = "0" + m;
        }

        if (day.length == 1) {
            day = "0" + day;
        }

        var curDate = y + "" + m + "" + day;
        console.log(curDate);

        var query = "SELECT notification.id,notification.appId,notification.title,notification.message,notification.url,notification.timeToLive,notification.dateStartSend,notification.timeStartSend,notification.sound, notification.smalIcon, notification.largeIcon, notification.bigPicture, notification.ledColor, notification.accentColor, notification.gId, notification.priority, apps.pkgNameAndroid, apps.pkgNameIos, notification.kind, notification.IsStop, notification.lastUpdateTime, notification.bigText, notification.summary, notification.budget, notification.isTest, notification.playerId FROM notification  inner join apps on notification.appId = apps.id where dateStartSend=" +curDate+" and notification.isSend = 0;";
        con.query(query, function (err, result, fields) {
            if (err) throw err;
            console.log(fields.length);
            if (fields.length > 0)
            {
            }
        });
    }

function db()
{
    con.connect(function (err) {
        if (err) throw err;
        console.log("Connected!");
        var sql = "INSERT INTO customers (name, address) VALUES ('Company Inc', 'Highway 37')";
        con.query(sql, function (err, result) {
            if (err) throw err;
            console.log("1 record inserted");

        });
    });
}

function gregorian_to_jalali(gy, gm, gd) {
    g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    if (gy > 1600) {
        jy = 979;
        gy -= 1600;
    } else {
        jy = 0;
        gy -= 621;
    }
    gy2 = (gm > 2) ? (gy + 1) : gy;
    days = (365 * gy) + (parseInt((gy2 + 3) / 4)) - (parseInt((gy2 + 99) / 100)) + (parseInt((gy2 + 399) / 400)) - 80 + gd + g_d_m[gm - 1];
    jy += 33 * (parseInt(days / 12053));
    days %= 12053;
    jy += 4 * (parseInt(days / 1461));
    days %= 1461;
    if (days > 365) {
        jy += parseInt((days - 1) / 365);
        days = (days - 1) % 365;
    }
    jm = (days < 186) ? 1 + parseInt(days / 31) : 7 + parseInt((days - 186) / 30);
    jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
    return [jy, jm, jd];
}


function jalali_to_gregorian(jy, jm, jd) {
    if (jy > 979) {
        gy = 1600;
        jy -= 979;
    } else {
        gy = 621;
    }
    days = (365 * jy) + ((parseInt(jy / 33)) * 8) + (parseInt(((jy % 33) + 3) / 4)) + 78 + jd + ((jm < 7) ? (jm - 1) * 31 : ((jm - 7) * 30) + 186);
    gy += 400 * (parseInt(days / 146097));
    days %= 146097;
    if (days > 36524) {
        gy += 100 * (parseInt(--days / 36524));
        days %= 36524;
        if (days >= 365) days++;
    }
    gy += 4 * (parseInt(days / 1461));
    days %= 1461;
    if (days > 365) {
        gy += parseInt((days - 1) / 365);
        days = (days - 1) % 365;
    }
    gd = days + 1;
    sal_a = [0, 31, ((gy % 4 == 0 && gy % 100 != 0) || (gy % 400 == 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    for (gm = 0; gm < 13; gm++) {
        v = sal_a[gm];
        if (gd <= v) break;
        gd -= v;
    }
    return [gy, gm, gd];
}