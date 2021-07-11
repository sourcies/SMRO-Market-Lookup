# SMRO-Market-Lookup

# Requirements

- NodeJS
- npm 7+
- python3
- pip3

# Getting started

1. Create a Discord Application in the developer portal and add it to your Discord server with the following OAuth2 scope:

- `applications.commands`
- `bot`

2. Then, deploy the bot

    2.1. Copy config file and edit accordingly
    ```
    copy config/config-template.toml config/config.toml
    ```
    
    2.2.
    ```
    pip3 install -r requirements.txt
    npm i
    npm run register
    npm start
    ```

    Commands will fan out slowly across all guilds within one hour.