// Function to setup the remote
var DeckRemote = function(config) {
    // Overwrite the default config
    if(config) {
        DeckRemoteWrapper.config = config;
    }
    
    // Dynamically include the socket.io script
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'http://' + DeckRemoteWrapper.config.host + ':' + DeckRemoteWrapper.config.port + '/socket.io/socket.io.js';
    head.appendChild(script);
    
    // Connect to the server when the socket is loaded
    script.onload= function() {
        // Check if it's a mirror
        if (window.location.href.indexOf('#mirror') != -1) {
            DeckRemoteWrapper.mirror.connect(false);
        }
        // Check if it's a slave
        else if (window.location.href.indexOf('#slave') != -1) {
            DeckRemoteWrapper.mirror.connect(true);
        }
        // Otherwise it's a normal (active) client
        else {
            DeckRemoteWrapper.client.connect();
        }
    };
};

// Object that contains all functions for remote controlling a deck
var DeckRemoteWrapper = {
    // The default config
    config: {
        host: 'localhost',
        port: 8333
    },
    
    // The current slide
    current_slide: 0,
    
    // A client is an active session: prev/next are send to the server
    client: {
        // Holds an instance of the socket
        __socket: null,
        
        // Connect to the server
        connect: function() {
            // Connect as a client
            var client = io.connect('http://' + DeckRemoteWrapper.config.host + ':' + DeckRemoteWrapper.config.port + '/client');
            
            // Store the reference to the socket
            DeckRemoteWrapper.client.__socket = client;
            
            // If connected to the server, start listening
            client.on('connect', function() {
                // Send the url of the page
                client.emit('url', window.location.href);
                
                // Listen for the next command
                client.on('next', function() {
                    // Go to the next slide
                    $.deck('next');
                });
                
                // Listen for the prev command
                client.on('prev', function() {
                    // Go to the previous slide
                    $.deck('prev');
                });
            });
            
            // Change the current slide number
            $(document).bind('deck.change', function(e, from, to) {
                DeckRemoteWrapper.current_slide = to;
            });
            
            // Send the status of the client to the server when the window is resized
            $(window).bind('resize', function() {
                DeckRemoteWrapper.client.sendStatus();
            });
            
            // Send the status of the client to the server when the deck is updated
            $(document).bind('deck.change deck.init', function() {
                DeckRemoteWrapper.client.sendStatus();
            });
        },
        
        // Send the status of the deck to the server
        sendStatus: function() {
            // Check for notes
            var notes = $('.hidden-notes', $.deck('getSlide', DeckRemoteWrapper.current_slide)).text();
            
            // Send the status to the server
            DeckRemoteWrapper.client.__socket.emit('status', {
                current: DeckRemoteWrapper.current_slide,
                notes: notes,
                size: {
                    width: $('body').width(),
                    height: $('body').height()
                }
            });
        }
    },
    
    // A mirror is a passive session: no data is send to the server
    mirror: {
        // Holds an instance of the socket
        __socket: null,
        
        // Connect to the server
        connect: function(as_slave) {
            // Connect as a mirror
            var mirror = io.connect('http://' + DeckRemoteWrapper.config.host + ':' + DeckRemoteWrapper.config.port + '/mirror');
            
            // Store the reference to the socket
            DeckRemoteWrapper.mirror.__socket = mirror;
            
            // If connected to the server, start listening
            mirror.on('connect', function() {
                // Ask for a status update
                mirror.emit('update status');
            });
            
            // Check weither it's a slave or not
            if(!as_slave) {
                // Listen for status updates
                mirror.on('status', function(data) {
                    // Check the offset of the mirror
                    var offset = parseInt(window.location.href.substr(7 + window.location.href.indexOf('#mirror')));
                    
                    // Go to the right slide
                    $.deck('go', data.current + offset);
                    
                    // Resize the deck
                    DeckRemoteWrapper.resize(data.size.width, data.size.height);
                });
            }
            else {
                // Listen for status updates
                mirror.on('status', function(data) {
                    // Go to the right slide
                    $.deck('go', data.current);
                });
            }
        }
    },
    
    // Resize the deck
    resize: function(width, height) {
        // Resize the body to match the body of the master deck
        $('body').width(width).height(height);
        
        // Calculate the ratio between the window and document width
        var scale = $(window).width() / $(document).width();
        
        // Try to scale the content of the window to fit the screen
        $('body').css({
            'transform': 'scale(' + scale + ')',
            'transform-origin': 'left top',
            '-webkit-transform': 'scale(' + scale + ')',
            '-webkit-transform-origin': 'left top',
            '-moz-transform': 'scale(' + scale + ')',
            '-moz-transform-origin': 'left top'
        });
        
        // Little trick for IE
        if (navigator.appVersion.match(/MSIE/)) {
            $('body').css('zoom', 100 * scale); 
        }
    }
};