var http = require('http');
var express = require('express');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
app.set('view engine', 'ejs');
server.listen(4000);

// Index page
app.get('/', function(req, res) {
	console.log("Request from " + req.ip)
	res.render("index.ejs");
});

// Files
app.use('/static', express.static(__dirname + '/static'));

// Start the server
app.listen(9000, function() {
	console.log('Listening on port 9000.');
});

// Game world
var World = {
    players: {},
    add: function(player) {
        World.players[player.id] = player;
    }
}

// Logging helper
function log(message) {
    var date = new Date();
    console.log(date.toLocaleTimeString() + " [" + message + "]");
}

// Socket.io
io.on('connection', function (socket) {

    // Listen for init call from client
    socket.on('init', function(data) {
        var newPlayer = {
            id: socket.id, 
            color: Math.floor(Math.random()*0xffffff), 
            connected: 1, 
            x: 0, y: 5, z: 0
        }
        World.add(newPlayer);
        log("init " + socket.id);
        socket.emit('init', newPlayer);
    });

    // Listen for position from client
    socket.on('update', function(data) {
        //log("update " + data.player.id);
        World.players[data.player.id] = data.player;
        // Send player position to client 
        socket.emit('update', {players: World.players});
    });

    // Listen for client disconnect
    socket.on('disconnect', function() {
        if (World.players[socket.id] != null) {
            log("disconnect " + socket.id)
            World.players[socket.id].connected = 0;
        } 
    });

});