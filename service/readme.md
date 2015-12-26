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

npm install forever -g
drop notes.conf into etc/init/notes.conf this will trigger start and stop of the server when vm is restarted.

one more problem currently, client.js code is hardcoded to point to http://localhost:2000/, needs to be updated in production to point to the right place http://gameserver.westus.cloudapp.azure.com:2000/. Will need to update there, and when updating server code will need to make sure it doesn't conflict!! :(

bit TODO here to make sure this isn't a problem in the future

test! :)
