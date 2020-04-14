# discord-fav-bot

## deploy using docker

1. `git pull https://github.com/TriFerd/discord-fav-bot.git`
2. `cd discord-fav-got`
3. insert discord bot token in `config.json` (`vim config.json` (paste with `ctrl` + `shift` + `v`))
4. `docker build -t <image-name>`
5. `docker build -t discord-fav-bot .`
6. `docker run -d --restart:always discord-fav-bot`
7. (`docker logs <container-id>`)
