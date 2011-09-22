// Function to setup the client
var RemoteClient = function(config) {
    // Overwrite the default config
    RemoteClientWrapper.config = $.extend({}, RemoteClientWrapper.config, config);
    
    // Dynamically include the socket.io script
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'http://' + RemoteClientWrapper.config.host + ':' + RemoteClientWrapper.config.port + '/socket.io/socket.io.js';
    head.appendChild(script);
    
    // Initialize the remote client when the socket is loaded
    script.onload = function() {
        // Connect to the server
        RemoteClientWrapper.server.connect();
        
        // Bind to the interface
        RemoteClientWrapper.bind();
    };
}

// Object that contains all functions for the remote client
var RemoteClientWrapper = {
    // The default config
    config: {
        host: 'localhost',
        port: 8333,
        keys: {
            // enter, space, page down, right arrow, down arrow,
            next: [13, 32, 34, 39, 40],
            // backspace, page up, left arrow, up arrow
            previous: [8, 33, 37, 38]
        },
        next: '#next',
        previous: '#prev'
    },
    
    // Connection to the server
    server: {
        // Holds an instance of the socket
        __socket: null,
        
        // Connect to the server
        connect: function() {
            // Connect as a server
            var server = io.connect('http://' + RemoteClientWrapper.config.host + ':' + RemoteClientWrapper.config.port + '/server');
            
            // Store the reference to the socket
            RemoteClientWrapper.server.__socket = server;
            
            // If connected to the server, start listening
            server.on('connect', function() {
                // Ask for a status update
                server.emit('update status');

                // When the url changes, update the mirrors
                server.on('url', function (url) {
                    $('#cur_frame').attr('src', url + '#mirror+0');
                    $('#next_frame').attr('src', url + '#mirror+1');
                });

                // When the status changes, update the interface
                server.on('status', function(status) {
                    $('#current-slide').text(status.current + 1);
                    $('#notes').text(status.notes);
                });
            });
        }
    },
    
    // Activate the interface
    bind: function() {
        // Bind key controls
        $(document).bind('keydown', function(e) {
            if (e.which === RemoteClientWrapper.config.keys.next || $.inArray(e.which, RemoteClientWrapper.config.keys.next) > -1) {
                RemoteClientWrapper.trigger.next();
                e.preventDefault();
            }
            else if (e.which === RemoteClientWrapper.config.keys.previous || $.inArray(e.which, RemoteClientWrapper.config.keys.previous) > -1) {
                RemoteClientWrapper.trigger.previous();
                e.preventDefault();
            }
        });
        
        // Implement next button
        $(RemoteClientWrapper.config.next).click(function() {
            RemoteClientWrapper.trigger.next();
        });
        
        // Implement previous button
        $(RemoteClientWrapper.config.previous).click(function() {
            RemoteClientWrapper.trigger.previous();
        });
    },
    
    // Trigger commands on the server
    trigger: {
        // Trigger the next slide command
        next: function() {
            RemoteClientWrapper.server.__socket.emit('next');
        },
        
        // Trigger the previous slide command
        previous: function() {
            RemoteClientWrapper.server.__socket.emit('prev');
        }
    },
    
    // Wrapper for the clock
    clock: {
        start_time: null,
        timer: null,
        
        // Start the clock
        start: function() {
            if (RemoteClientWrapper.clock.timer) {
                clearInterval(RemoteClientWrapper.clock.timer);
                RemoteClientWrapper.clock.timer = null;
                $('#start-stop-clock').text('Start Timer');
                return;
            }
            RemoteClientWrapper.clock.startDate = new Date();
            RemoteClientWrapper.clock.timer = setInterval(RemoteClientWrapper.clock.update, 1000);
            $('#start-stop-clock').text('Stop Timer');
            RemoteClientWrapper.clock.update();
        },
        
        // Update the clock
        update: function() {
            var now = new Date();
            var ms = now.getTime() - RemoteClientWrapper.clock.start_time.getTime();
            var milliseconds = ms % 1000;
            milliseconds = "" + milliseconds;
            while (milliseconds.length < 3) milliseconds += '0';
            var x = Math.floor(ms / 1000);
            var seconds = x % 60;
            if (seconds < 10) seconds = '0' + seconds;
            x = Math.floor(x / 60);
            var minutes = x % 60;
            if (minutes < 10) minutes = '0' + minutes;
            x = Math.floor(x / 60);
            var hours = x;
            if (hours < 10) hours = '0' + hours;
            $('#clock').text(hours + ":" + minutes + ":" + seconds);
            $('#time').text(now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds());
        }
    }
};

$(function() {
    new RemoteClient();
    $('#start-stop-clock').click(RemoteClientWrapper.clock.start);
});