This folder is generally aimed at making the process of setting up the game on a real server a bit easier. Setup steps:

1. create azure vm, decide specs doesn't matter much, remember admin account. Choose the new Deployment Manager scheme instead of classical.
2. create Network Security Group, associate it with the network the vm lives in, add rules opening port 80 for web traffic, 2000 for tcp game socket connection
3. on server install:
git,
node,
nginx, (production static file server, use gulp for develop)
drop nginx.conf into etc/nginx/nginx.conf
nginx or "nginx -s reload" if started

adduser game, do following into home/game
git clone ige repo, npm install ige/server
git clone base-game repo, npm install in base-game

from base-game/src start the server:
node ../../ige/server/ige.js -g .

test! :)
