# BaseGame

The north star for this game is that we want players to be able to define their own abilities so that every player to player interaction is unique and interesting. It is largely based on pvp combat, though pve will certainly be part of the game. In order to help balance arbitrary abilities (think "spawn a field of crazy death fire all around me"), smart ability-class design will be required, along with an overall coefficient manager that helps to tune the power for each type of ability.

Some choices may seem strange, but help realize this goal, for instance a character does not have an abilitySet on the client side. This is because we don't want anyone to know anything about other player's abilities, even if they scraped non-visible data.

Eventually the goal is to use a micro transaction model to sell special player and ability skins, but this relies on combat being fun and gameplay being compelling first :) (and those damn azure servers working). 

## Setup

Because IGE isn't provided as a node package, this has a bit more setup than we would like, but it still isn't bad!

1. Install Node and Git!
2. "git clone" this and the ige repo, both must be cloned into the same directory and the ige root folder should be called "ige"
3. "npm install" in both ige/server and this root
4. "npm install gulp -g" to get gulp available on the command line nicely

Once you've done the above, you should be able enter "gulp" from the command line to see whats available. Things like linting (making sure style is nice), documentation building, and watch should all be there. Watch is something cool that will notice when you change server resources and restart your server for you.

## The Basics

This project revolves around 2 different web servers. The first is a simple http server hosted by gulp for now, this is started by "gulp server:static". The second is a tcp socket connection managed by IGE that is started by "gulp server:socket". If you haven't got the ige repo available in the next directory up, this is going to hit problems as it assumes the engine code is there to serve up to the client. Running "gulp server" will start both of these up, or you can just run "gulp watch" to start both and then listen for file changes and restart the socket server when appropriate. Gulp only manages these servers in development, there is a separate set up for production / test servers. Once you do "gulp server" or "gulp watch", localhost:8000 should serve up assets, src, and ../ige folders and default to src/index.html. localhost:2000 should be your socket port, but the client will handle this connection.

### Architecture

The business classes live under src, mostly under gameclasses. Server and client modules are pretty obvious, ServerNetworkEvents and ClientNetworkEvents encapsulate the receive handlers for any possible message though the emit may be triggered anywhere in the code. Things labeled as Components are things that can be added to a class and change the behaviour of that class, this means some method will actually be called every tick after adding that component. The rest of them are just modules that should be easy enough to read through.

All images live under Assets, with Official being the location of anything I have personally created and that won't possibly get me sued in the long run. Before anything is distributed publically, everything needs to use an official asset.

Service hosts additional resources that are used to set up the service including the static file server configuration, the forever js configuration, and the hooks that help automatically move things.
