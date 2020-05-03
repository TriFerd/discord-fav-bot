# discord-fav-bot

## setting up rootless docker

1. install rootless docker `curl -fsSL https://get.docker.com/rootless | sh`
2. add env to ~/.bashrc
  1. `export PATH=/home/<user>/bin:$PATH`
  2. `export PATH=$PATH:/sbin`
  3. `export DOCKER_HOST=unix:///run/user/<user-id>/docker.sock` (user-id: `id -u`)
3. `systemctl --user start docker`
4. auto start docker `systemctl --user enable docker`

[source](https://docs.docker.com/engine/security/rootless/)

## deploy using docker-compose

1. `git clone https://github.com/TriFerd/discord-fav-bot.git`
2. `cd discord-fav-got`
3. insert discord bot token in `.env` (`vim .env` (paste with `ctrl` + `shift` + `v`))
4. `docker-compose up --build`

## deploy using docker

1. `git clone https://github.com/TriFerd/discord-fav-bot.git`
2. `cd discord-fav-got`
3. insert discord bot token in `.env` (`vim .env` (paste with `ctrl` + `shift` + `v`))
4. `docker build -t discord-fav-bot .`
5. `docker run -d --name fav-bot --restart always --env-file .env discord-fav-bot`

[source](https://nodejs.org/fr/docs/guides/nodejs-docker-webapp/)