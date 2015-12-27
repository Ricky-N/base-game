This folder is generally aimed at making the process of setting up the game on a real server a bit easier. Setup steps:

1. create azure vm, decide specs doesn't matter much, remember admin account. Choose the new Deployment Manager scheme instead of classical.
2. create Network Security Group, associate it with the network the vm lives in, add rules opening port 80 for web traffic, 2000 for tcp game socket, 22 for ssh
3. on server install:
git,
node,
nginx, (production static file server, use gulp for develop)
drop nginx.conf into etc/nginx/nginx.conf
nginx or "nginx -s reload" if started

4. set up git repo, in admin user home folder create repositories folder,
create symlink git to this folder this ensures tight access control, adduser git add necessary public keys to /home/git/.ssh/authorized_keys. Add bare git repo here, drop post-receive into hooks folder, make sure post-receive has chmod 711 so it can be executed on receive.

5. adduser game, do following into home/game
git clone ige repo, npm install ige/server
git clone base-game repo, npm install in base-game
create group gameAdmins, add game and git to this group

6. npm install forever -g
drop notes.conf into etc/init/notes.conf this will trigger start and stop of the server when vm is restarted.

should be good to go! ;)
