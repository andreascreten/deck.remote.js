$(function() {
    // Deck initialization
    $.deck('.slide');
    
    // Initialize the Deck Remote
    new DeckRemote({
        host: 'localhost',
        port: 8333
    });
});
