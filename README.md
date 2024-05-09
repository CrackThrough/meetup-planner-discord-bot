# Meetup Planner Discord Bot

This is a scuffed and rushed discord bot to create meetup things easier.

## Setup

### Using Docker

Copy `config.exmaple.json` to create `config.json`, and fill the contents. `guilds` is an array of guild snowflakes.

Don't forget to fill out `.env` as well.

```sh
# Start the bot container
docker run --name meetup-planner --restart always -d -v $PWD/config.json:/app/config.json -v $PWD/data:/data -e DATABASE_URL=file:/data/ ghcr.io/crackthrough/meetup-planner-discord-bot:latest

# Migrate
docker exec meetup-planner pnpm prisma migrate deploy
```

### Manual Setup

0.  (Optionally) Use Nix

    If you use [Nix](https://nixos.org) to run nodejs, prisma will fail to load openssl.

    Alternatively, I suggest using predefined direnv flake.

    ```sh
    direnv allow
    ```

1.  Install Packages

    Optionally use corepack, run `pnpm i`. That's it.

2.  Build

    ```sh
    pnpm build
    ```

3.  Configure

    First, copy and rename `config.example.json` to `config.json` and fill up your config file.

    Second, create a file named `.env` containing:

    ```sh
    DATABASE_URL=file:./meetup.db
    ```

4.  Migrate DB

    You can simply run below command to migrate the database you specified at above section:

    ```sh
    pnpm prisma migrate deploy
    ```

5.  Run

    ```sh
    pnpm start
    ```

    Now you've done it.

# Credits

Huge thanks to [paring](https://github.com/pikokr) for both technical and emotional support.
