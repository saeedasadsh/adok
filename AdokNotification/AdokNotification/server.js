﻿var net = require("net");
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

//con.end((err) => {
//    // The connection is terminated gracefully
//    // Ensures all previously enqueued queries are still
//    // before sending a COM_QUIT packet to the MySQL server.
//    console.log('Connection closed');
//});



var server = net.createServer();
var StringDecoder = require('string_decoder').StringDecoder;

//var _ip = "94.130.122.236";
var _ip = "188.253.2.147";

var _port = 3010;

//var Notifications = [];
var Players = [];
//var delivery = [];
//var testNoti = [];

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
                                Players[pkgs[j]] = { players: [] };
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
                                Players[pkgs[j]].players[playerId].alive = n;
                            }
                        }
                    }
                    socket.write(JSON.stringify(data) + "\n");
                }
                else if (knd == "Deliver") {
                    var nid = dt.nid;
                    var query = "SELECT id,count from nodeDelivery where nid=" + nid + " and playerId=" + playerId + ";";
                    con.query(query, function (err, resultDelivery, fields) {
                        if (err) throw err;

                        if (resultDelivery.length > 0) {
                            resultDelivery.forEach((row) => {
                                var did = row.id;
                                var dcount = row.count;
                                dcount++;
                                var query2 = "update nodeDelivery set  count=" + dcount + " where id=" + did + ";";
                                con.query(query2, function (err, resultUpdate, fields) {
                                    if (err) throw err;
                                });
                            });
                        }
                        else {
                            var query2 = "insert into nodeDelivery (nid,playerId,count) values (" + nid + "," + playerId + ",1);";
                            con.query(query2, function (err, resultUpdate, fields) {
                                if (err) throw err;
                            });
                        }
                    });
                }
            }
            catch (e) {
                console.log("3: " + e.message);
            }
        });

        socket.on('close', function (data) {
            try {
                PlayerDisonnected(myId);
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
            PlayerDisonnected(myId);
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

function PlayerConnected(pid, pkgs) {

    var curDate = GetCurrentDate();
    var tm = GetCurrentTime();


    var sql = "update players set 	isConnected=1,lastTime='" + tm + "',lastDate=" + curDate + " where id=" + pid;
    con.query(sql, function (err, result) {
        if (err) {
        }
    });

    var pkgEx = pkgs;
    for (var i = 0; i < pkgEx.length; i++) {
        if (pkgEx[i] != "") {
            var pkName = pkgEx[i];
            var sql2 = "select id from playerNotifConnect where  playerId=" + pid + " and pkgName='" + pkName + "'";
            con.query(sql2, function (err, result2) {
                if (err) {
                }
                else {
                    if (result2.length > 0) {
                        result2.forEach((row) => {
                            var id = row.id;
                            sql3 = "update playerNotifConnect set time='" + tm + "',date=" + curDate + "  where id=" + id;
                            con.query(sql3, function (err, result3) {
                                if (err) {
                                }
                            });
                        });
                    }
                    else {
                        sql3 = "insert into playerNotifConnect (playerId,pkgName,date,time) values (" + pid + ",'" + pkName + "'," + curDate + ",'" + tm + "')";
                        con.query(sql3, function (err, result3) {
                            if (err) {
                            }
                        });
                    }
                }
            });
        }
    }
}

function PlayerDisonnected(pid) {

    var d = new Date();
    var y = d.getFullYear();
    var m = d.getMonth();
    m++;
    var day = d.getDate();
    var dateHijri = gregorian_to_jalali(y, m, day);
    y = dateHijri[0];
    m = dateHijri[1];
    day = dateHijri[2];
    var n = d.getTime();
    var mounth = "";
    var dayOfMounth = "";
    if (m < 10) {
        mounth = "0" + m;
    }
    else {
        mounth = m;
    }

    if (day < 10) {
        dayOfMounth = "0" + day;
    }
    else {
        dayOfMounth = day;
    }

    var curDate = y + "" + mounth + "" + dayOfMounth;

    var h = d.getHours(); // => 9
    var Min = d.getMinutes(); // =>  30

    var hour = "";
    var minute = "";
    var tm = "";

    if (h < 10) {
        hour = "0" + h;
    }
    else {
        hour = h;
    }

    if (Min < 10) {
        minute = "0" + Min;
    }
    else {
        minute = Min;
    }
    tm = hour + minute;

    var sql = "update players set 	isConnected=0,disTime='" + tm + "',disDate=" + curDate + " where id=" + pid;
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("player diconnected");

    });
}



function GetNotifications() {
    try {
        var d = new Date();
        var y = d.getFullYear();
        var m = d.getMonth();
        m++;
        var day = d.getDate();
        var dateHijri = gregorian_to_jalali(y, m, day);
        y = dateHijri[0];
        m = dateHijri[1];
        day = dateHijri[2];
        day -= 3;
        if (day < 1) {
            m--;
            if (m < 1) {
                m = 12;
                if (y % 4 == 3) {
                    day = 30 + day + 1;
                    y--;
                }
                else {
                    day = 29 + day + 1;
                }
            }
            else if (m <= 6) {
                day = 31 + day + 1;
            }
            else {
                day = 30 + day + 1;
            }
        }


        var n = d.getTime();
        var mounth = "";
        var dayOfMounth = "";
        if (m < 10) {
            mounth = "0" + m;
        }
        else {
            mounth = m;
        }

        if (day < 10) {
            dayOfMounth = "0" + day;
        }
        else {
            dayOfMounth = day;
        }

        var curDatev = y + "" + mounth + "" + dayOfMounth;
        for (var eachItem in Players) {
            for (var eachPlayer in Players[eachItem].players) {
                var player = Players[eachItem].players[eachPlayer];
                var dif = n - player.alive;
                if (dif > 150000) {
                    PlayerDisonnected(player.playerId);
                    delete Players[eachItem].players[eachPlayer];
                }
            }
        }

        var query = "SELECT notification.id,notification.appId,notification.title,notification.message,notification.url,notification.timeToLive,notification.dateStartSend,notification.timeStartSend,notification.sound, notification.smalIcon, notification.largeIcon, notification.bigPicture, notification.ledColor, notification.accentColor, notification.gId, notification.priority, apps.pkgNameAndroid, apps.pkgNameIos, notification.kind, notification.IsStop, notification.lastUpdateTime, notification.bigText, notification.summary, notification.budget, notification.isTest, notification.playerId FROM notification  inner join apps on notification.appId = apps.id where dateStartSend>=" + curDatev + " and notification.isSend = 0;";

        con.query(query, function (err, result, fields) {
            if (err) throw err;
            result.forEach((row) => {
                var id = row.id;
                var appId = row.appId;
                var title = row.title;
                var message = row.message;
                var url = row.url;
                var timeToLive = row.timeToLive;
                var dateStartSend = row.dateStartSend;
                var timeStartSend = row.timeStartSend;
                var sound = row.sound;
                var smalIcon = row.smalIcon;
                var largeIcon = row.largeIcon;
                var bigPicture = row.bigPicture;
                var ledColor = row.ledColor;
                var accentColor = row.accentColor;
                var gId = row.gId;
                var priority = row.priority;
                var pkgNameAndroid = row.pkgNameAndroid;
                var pkgNameIos = row.pkgNameIos;
                var kind = row.kind;
                var AdditionalData = row.AdditionalData;
                var btns = row.btns;
                var lastUpdateTime = row.lastUpdateTime;
                var IsStop = row.IsStop;
                var bigText = row.bigText;
                var summary = row.summary;
                var isTest = row.isTest;
                var testId = row.playerId;

                //-------------------------------------------------------------------------------
                var additionalData = [];
                var queryad = "select dtKey,dtValue from notiAdditionalData where nid=" + row.id;
                con.query(queryad, function (errad, resultad, fieldsad) {
                    if (errad) throw errad;



                    resultad.forEach((rowad) => {
                        additionalData.push({ "dtKey": rowad.dtKey, "dtValue": rowad.dtValue });
                    });
                });
                //-------------------------------------------------------------------------------
                var btns = [];
                var queryad = "select id,nId,	btnText,url,icon from notiBtn where nid=" + row.id;
                con.query(queryad, function (errad, resultad, fieldsad) {
                    if (errad) throw errad;



                    resultad.forEach((rowad) => {
                        btns.push({ "id": rowad.id, "nId": rowad.nId, "btnText": rowad.btnText, "url": rowad.url, "icon": rowad.icon });
                    });
                });
                //---------------------------------------------------------------------------------


                var timeToSend = timeStartSend + timeToLive;
                var sendH = Math.floor(timeToSend / 60);
                var sendM = Math.floor(timeToSend % 60);
                var Days = 0;
                var HAfter = 0;
                if (sendH > 24) {
                    Days = Math.floor(sendH / 24);
                    HAfter = Math.floor(sendH - (Days * 24));
                }
                else {
                    HAfter = sendH;
                }

                var yy = parseInt(dateStartSend.toString().substr(0, 4));
                var mm = parseInt(dateStartSend.toString().substr(4, 2));
                var dd = parseInt(dateStartSend.toString().substr(6, 2));

                var curDateEnd = "";
                if (Days > 0) {
                    dd += Days;
                    if (dd > 29 && mm == 12 && y % 4 != 3) {
                        dd = dd - 29;
                        mm = 1;
                        yy++;
                    }
                    else if (dd > 30 && mm == 12 && y % 4 == 3) {
                        dd = dd - 30;
                        mm = 1;
                        yy++;
                    }
                    else if (dd > 31 && mm <= 6) {
                        dd = dd - 31;
                        mm++;
                    }
                    else if (dd > 30 && mm > 6) {
                        dd = dd - 30;
                        mm++;
                    }
                }



                
                var year = ""+yy;
                var mounth = "";
                var dayOfMounth = "";
                if (m < 10) {
                    mounth = "0" + m;
                }
                else {
                    mounth = m;
                }

                if (day < 10) {
                    dayOfMounth = "0" + day;
                }
                else {
                    dayOfMounth = day;
                }

                var curDateEnd = year + "" + mounth + "" + dayOfMounth;

                var hcur = d.getHours();


                var noti = {
                    id: row.id, appId: row.appId, title: row.title, message: row.message, url: row.url, timeToLive: row.timeToLive
                    , dateStartSend: row.dateStartSend, timeStartSend: row.timeStartSend, sound: row.sound, smalIcon: row.smalIcon, largeIcon: row.largeIcon
                    , bigPicture: row.bigPicture, ledColor: row.ledColor, accentColor: row.accentColor, gId: row.gId, priority: row.priority
                    , pkgNameAndroid: row.pkgNameAndroid, pkgNameIos: row.pkgNameIos, kind: row.kind,
                    bigText: row.bigText, summary: row.summary, AdditionalData: additionalData, btns: btns, Meskind: "noti"
                };

                if (isTest > 0) {
                    if (pkgNameAndroid != "") {
                        if (Players[pkgNameAndroid] != undefined) {
                            if (Players[pkgNameAndroid].players[testId] != undefined) {
                                Players[pkgNameAndroid].players[testId].socket.write(JSON.stringify(noti) + "\n");
                                object.splice(index, 1);
                            }
                        }
                    }

                    if (pkgNameIos != "") {
                        if (Players[pkgNameIos] != undefined) {
                            if (Players[pkgNameIos].players[testId] != undefined) {
                                Players[pkgNameIos].players[testId].socket.write(JSON.stringify(noti) + "\n");
                                object.splice(index, 1);
                            }
                        }
                    }
                }
                else {
                    console.log(curDatev + " " + curDateEnd + " " + hcur + " " + HAfter);
                    console.log(GetCurrentTime());
                    if (curDatev <= curDateEnd && hcur <= HAfter) {
                        if (IsStop == 0) {
                            console.log("go to send noti: " + noti.id);
                            if (Players[pkgNameAndroid] != undefined) {
                                Players[pkgNameAndroid].players.forEach(function (itemp, indexp, objectp) {
                                    if (itemp.socket == undefined) {
                                        objectp.splice(indexp, 1);
                                    }
                                    else {
                                        var query3 = "SELECT id,count from nodeDelivery where nid=" + noti.id + " and playerId=" + itemp.playerId + ";";
                                        con.query(query3, function (err, resultDelivery, fields) {
                                            if (err) throw err;
                                            if (resultDelivery.length > 0) {
                                                resultDelivery.forEach((rowDelivery) => {
                                                    var cn = rowDelivery.count;
                                                    if (cn <= 5) {
                                                        itemp.socket.write(JSON.stringify(noti) + "\n");
                                                    }
                                                });
                                            }
                                            else {
                                                var query3 = "insert into nodeDelivery (nid,playerId,count) values (" + noti.id + "," + itemp.playerId + ",0);";
                                                con.query(query3, function (err, resultDelivery, fields) {
                                                });
                                                itemp.socket.write(JSON.stringify(noti) + "\n");
                                            }
                                        });
                                    }
                                });
                            }

                            if (Players[pkgNameIos] != undefined) {
                                Players[pkgNameIos].players.forEach(function (itemp, indexp, objectp) {
                                    if (itemp.socket == undefined) {
                                        objectp.splice(indexp, 1);
                                    }
                                    else {
                                        var query3 = "SELECT id,count from nodeDelivery where nid=" + noti.id + " and playerId=" + itemp.playerId + ";";
                                        con.query(query3, function (err, resultDelivery, fields) {
                                            if (err) throw err;
                                            if (resultDelivery.length > 0) {
                                                resultDelivery.forEach((rowDelivery) => {
                                                    var cn = rowDelivery.count;
                                                    if (cn <= 5) {
                                                        itemp.socket.write(JSON.stringify(noti) + "\n");
                                                    }
                                                });
                                            }
                                            else {
                                                itemp.socket.write(JSON.stringify(noti) + "\n");
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    }
                    else {
                        //stop send
                        var queryst = "update notification set IsStop=1 where id=" + row.id;
                        con.query(queryst, function (errst, resultst, fieldsst) {
                            if (errst) throw errst;
                        });
                    }

                }
            });
        });
    }
    catch (e) {
         console.log("10: " + e.message);
    }
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

function GetCurrentDate() {
    var d = new Date();
    var y = d.getFullYear();
    var m = d.getMonth();
    m++;
    var day = d.getDate();
    var dateHijri = gregorian_to_jalali(y, m, day);
    y = dateHijri[0];
    m = dateHijri[1];
    day = dateHijri[2];
    var n = d.getTime();
    var mounth = "";
    var dayOfMounth = "";
    if (m < 10) {
        mounth = "0" + m;
    }
    else {
        mounth = m;
    }

    if (day < 10) {
        dayOfMounth = "0" + day;
    }
    else {
        dayOfMounth = day;
    }

    var curDate = y + "" + mounth + "" + dayOfMounth;
    return curDate;
}

function GetCurrentTime() {
    var d = new Date();
    var h = d.getHours(); // => 9
    var Min = d.getMinutes(); // =>  30

    var hour = "";
    var minute = "";
    var tm = "";

    if (h < 10) {
        hour = "0" + h;
    }
    else {
        hour = h;
    }

    if (Min < 10) {
        minute = "0" + Min;
    }
    else {
        minute = Min;
    }
    tm = hour + minute;
    return tm;
}