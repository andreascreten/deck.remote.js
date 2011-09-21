#!/usr/bin/env node

var config = {
    port: 8333,
    debug: true
};

// Create a new server on the specified port
var io = require('./socket.io').listen(config.port);

// Disable Socket IO verbose output
io.set('log level', 1);

// Variable to store the current deck state
var current_state = {
    url: null,
    status: {}
}

// Send startup info
debug('Remote: Server started on port ' + config.port);

// Create a new namespace for the servers
var server = io.of('/server').on('connection', function (socket) {
    debug('Remote: A new server connected');
    
    // Send the current satus to the server if he asks for it
    socket.on('update status', function() {
        debug('Server: Asking status update');
        
        socket.emit('status', current_state.status);
        socket.emit('url', current_state.url);
    });
    
    // Pipe the next command to the client
    socket.on('next', function () {
        debug('Server: Going to the next slide');
        
        client.emit('next');
    });
    
    // Pipe the prev command to the client
    socket.on('prev', function () {
        debug('Server: Going to the previous slide');
        
        client.emit('prev');
    });
});

// Create a new namespace for the mirrors
var mirror = io.of('/mirror').on('connection', function (socket) {});

// Create a new namespace for the clients
var client = io.of('/client').on('connection', function (socket) {
    debug('Remote: A new client connected');
    
    // Send the deck url to the servers
    socket.on('url', function(url) {
        debug('Client: Updating deck url');
        
        current_state.url = url;
        server.emit('url', url);
    });
    
    // Send the deck status to both server and mirror
    socket.on('status', function(status) {
        debug('Client: Updating deck status');
        
        current_state.status = status;
        server.emit('status', status);
        mirror.emit('status', status);
    });
});

// Debug function
function debug(message) {
    if(config.debug) {
        console.log(message);
    }
}