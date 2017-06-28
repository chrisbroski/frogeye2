/*jslint node: true */

/*
Initialize frogye.js and connect to viewer via socket.io
*/
var http = require("http");
var fs = require("fs");
var server;
var io;
var port = 3789;
var spawn = require('child_process').spawn;
var fs = require("fs");
var frogeye = require("./frogeye.js");
//var Senses = require('./Senses.js');
//var senses = new Senses(64, 48, !!process.argv[2]);
var visionWidth = 64;
var visionHeight = 48;
var partialImgData = '';
var virt_timer;

function app(req, rsp) {
    if (req.url === "/img/favicon.png") {
        rsp.writeHead(200, {'Content-Type': 'image/png'});
        fs.createReadStream(__dirname + '/img/favicon.png').pipe(rsp);
    } else {
        rsp.writeHead(200, {'Content-Type': 'text/html'});
        fs.createReadStream(__dirname + '/viewer.html').pipe(rsp);
    }
}

server = http.createServer(app);
io = require('socket.io')(server);

function vision(yuvData, imgRawFileSize, imgPixelSize) {
    var lumaData = [],
        ii;

    // The Pi camera gives a lot of crap data in yuv time lapse mode.
    // This is an attempt to recover some of it
    if (yuvData.length < imgRawFileSize - 1) {
        if (yuvData.length + partialImgData.length === imgRawFileSize) {
            yuvData = Buffer.concat([partialImgData, yuvData], imgRawFileSize);
        } else {
            partialImgData = yuvData;
            return;
        }
    }
    partialImgData = '';

    // Data conversion. In this case an array is built from part of a binary buffer.
    for (ii = 0; ii < imgPixelSize; ii += 1) {
        lumaData.push(yuvData.readUInt8(ii));
    }
    return lumaData;
}

function virt(i, imgRawFileSize, imgPixelSize) {
    var imgNum = parseInt(i / 10, 10) % 2 + 1;
    i += 1;

    fs.readFile(__dirname + '/test' + imgNum + '.raw', function (err, data) {
        var feData;
        if (err) {
            throw err;
        }

        feData = frogeye(vision(data, imgRawFileSize, imgPixelSize), imgPixelSize, visionWidth, 20);
        io.emit('senseState', JSON.stringify({
            dimensions: [64, 48],
            motionLocation: feData.moveLocation,
            brightnessOverall: feData.brightness,
            edges: feData.edges
        }));

        virt_timer = setTimeout(function () {virt(i, imgRawFileSize, imgPixelSize); }, 250);
    });
}

io.on('connection', function (socket) {
    console.log('Frogeye viewer client connected');
    virt(1, visionWidth * visionHeight * 1.5, visionWidth * visionHeight);

    socket.on('disconnect', function () {
        if (virt_timer) {
            clearTimeout(virt_timer);
        }
        console.log('Frogeye viewer client disconnected');
    });
});

server.listen(port, function () {
    console.log('Frogeye view server listening on http://0.0.0.0/:' + port);
});
