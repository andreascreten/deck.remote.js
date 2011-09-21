/*!
Deck JS - deck.goto - v1.0
Copyright (c) 2011 Caleb Troughton
Dual licensed under the MIT license and GPL license.
https://github.com/imakewebthings/deck.js/blob/master/MIT-license.txt
https://github.com/imakewebthings/deck.js/blob/master/GPL-license.txt
*/

/*
This module adds the necessary methods and key bindings to show and hide a form
for jumping to any slide number in the deck (and processes that form
accordingly). The form-showing state is indicated by the presence of a class on
the deck container.
*/
(function($, deck, undefined) {
    var current_slide = 0;
    var $d = $(document);
    
    // Check if it's a mirror
    if (window.location.href.indexOf('#mirror') != -1) {
        // Check the offset of the mirror
        var offset = parseInt(window.location.href.substr(7 + window.location.href.indexOf('#mirror')));
        
        // Connect as a mirror
        var mirror = io.connect('http://localhost:8333/mirror');
        
        // If connected to the server, start listening
        mirror.on('connect', function() {
            // Listen for status updates
            mirror.on('status', function(data) {
                // Go to the right slide
                $.deck('go', data.current + offset);
            });
        });
    }
    else {
        // Connect as a client
        var client = io.connect('http://localhost:8333/client');
        
        // If connected to the server, start listening
        client.on('connect', function() {
            // Send teh url of the page
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
        $d.bind('deck.change', function(e, from, to) {
            current_slide = to;
        });
        
        // Send the status of the client to the server
        $d.bind('deck.change deck.init', function() {
            // Check for notes
            var notes = $('.hidden-notes', $[deck]('getSlide', current_slide)).text();
            
            // Send the status to the server
            client.emit('status', {
                current: current_slide,
                notes: notes
            });
        });
    }
})(jQuery, 'deck');