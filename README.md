deck.js remote
=============

Usage
-------------

To run deck.remote.js you must include deck-remote/deck.remote.js to your deck.js slides. No stylesheets or html is required.

Before starting the presentation run the node.js daemon located in deck-remote-server/main.js. Make sure you init and update submodules.

Once the daemon is running, open your presentation and the client (deck-remote-client/index.html) in your browser. Changes made on the client should reflect on the server, and the other way around.

At the moment it has only been tested with Firefox & Chrome.

Todo
-------------

- Allow ip and port configuration in a general way (now needs to be set in both server and client)
- Improving client UI
- Test more browsers
- Mobile client version (This should be part of the new UI)
- Write technical documentation