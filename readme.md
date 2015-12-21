# BaseGame

The Isogenic Game Engine (IGE) seems to provide a lot of really awesome functionality to get a client-server game going quickly, but it is necessarily very generic and there is still a ton of modelling required for even the most basic game. There are certain things which really exist across most if not all games though, for instance players, items, menus, health, interactions, and so on. This is aimed at providing a basic set of generic game models with good bones so that it is easier to make complex games!

## Setup

Because IGE isn't provided as a node package, this has a bit more setup than we would like, but it still isn't bad!

1. Install Node and Git!
2. "git clone" this and the ige repo, both must be cloned into the same directory and the ige root folder should be called "ige"
3. "npm install" in both ige/server and this root
4. "npm install gulp -g" to get gulp available on the command line nicely

Once you've done the above, you should be able enter "gulp" from the command line to see whats available. Things like linting (making sure style is nice), documentation building, and watch should all be there. Watch is something cool that will notice when you change server resources and restart your server for you.

## The Basics

This project revolves around 2 different web servers. The first is a simple http server hosted by gulp for now, this is started by "gulp server:static". The second is a tcp socket connection managed by IGE that is started by "gulp server:socket". If you haven't got the ige repo available in the next directory up, this is going to hit problems as it assumes the engine code is there to serve up to the client. Running "gulp server" will start both of these up, or you can just run "gulp watch" to start both and then listen for file changes and restart the server when appropriate. There is probably a good argument for not letting gulp manage the static file server so we can have auth, middleware, etc, but for simplicity I will assume we don't care about any of that for now.

Once you do "gulp server" or "gulp watch" (and wait for it to start up, watch can be a bit slow on init), localhost:8000 should serve up assets, src, and ../ige folders and default to src/index.html. localhost:2000 should be your socket port, if you want to run this on some public server you should just have to open up those ports on that machine, do the full dev install process above, and run "gulp server". For now, if you do that stuff and just open localhost:8000 it should just load the game, you can try it on a couple of different browser windows to prove to yourself that there is syncing going on between the different clients.
