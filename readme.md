# BaseGame

The Isogenic Game Engine (IGE) seems to provide a lot of really awesome functionality to get a client-server game going quickly, but it is necessarily very generic and there is still a ton of work required just to get something that even remotely looks like a game going. The examples are pretty good, but often the structure choices made there don't extend well to anything that will stand up to a few thousand lines of code. I thought I would refactor a few examples together just to help others skip the start of stitching everything together.

There are a billion ways to make this better, but at some point things started getting more and more specific to the goals for my game, so I have decided to mostly leave this as an initial rough draft for others to build on top of if they wish. Besides, we don't want to take all the fun out of it right? :)

## Setup

Because IGE isn't provided as a node package, this has a bit more setup than we would like, but it still isn't bad!

1. Install Node and Git!
2. "git clone" this and the ige repo, both must be cloned into the same directory and the ige root folder should be called "ige"
3. "npm install" in both ige/server and this root
4. "npm install gulp -g" to get gulp available on the command line nicely

Once you've done the above, you should be able enter "gulp" from the command line to see whats available. Things like linting (making sure style is nice), documentation building, and watch should all be there. Watch is something cool that will notice when you change server resources and restart your server for you.

## The Basics

This project revolves around 2 different web servers. The first is a simple http server hosted by gulp for now, this is started by "gulp server:static". The second is a tcp socket connection managed by IGE that is started by "gulp server:socket". If you haven't got the ige repo available in the next directory up, this is going to hit problems as it assumes the engine code is there to serve up to the client. Running "gulp server" will start both of these up, or you can just run "gulp watch" to start both and then listen for file changes and restart the server when appropriate. There is probably a good argument for not letting gulp manage the static file server so we can have auth, middleware, etc, but for simplicity I will assume we don't care about any of that for now.

Once you do "gulp server" or "gulp watch" (and wait for it to start up, watch can be a bit slow on init), localhost:8000 should serve up assets, src, and ../ige folders and default to src/index.html. localhost:2000 should be your socket port, if you want to run this on some public server you should just have to open up those ports on that machine, do the full dev install process above, and run "gulp server". The only issue there is that the client is hardcoded to point to localhost and you would have to make it so that it could point to your server instead. For now, if you do that stuff and just open localhost:8000 it should just load the game, you can try it on a couple of different browser windows to prove to yourself that there is syncing going on between the different clients.

Movement is controlled with wasd keys, q will just burn health for now and e will burn power, this was proof of concept that we could update the server character from a client action and have that impact the UI back on the clients. 

### Architecture

There is still quite a bit of messy code here, most of this project was just refactoring different example projects to put together a more full game. A Character is something that has a position in the world and a representation, right now there are only player characters which is just a character enhanced with the PlayerComponent so that a client can control it. I separated the network receive events for the client and server into appropriate *NetworkEvent classes so that it is a bit more obvious where to look, but they are very messy right now :/. StatusComponent is the proof of concept for having some additional streaming property on the character, it manages health and power right now and can trigger change listeners. The ControlPanel is the user interface code and is also quite messy, but mostly a proof of concept. The rest is mostly just jammed into the client and server classes as it was too light weight for me to bother refactoring it into its own segment for now.  
