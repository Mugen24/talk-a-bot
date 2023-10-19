#!/bin/bash

token=$(aws ssm get-parameter --name talk-a-bot_token | jq .Parameter.Value)
guildId=$(aws ssm get-parameter --name talk-a-bot_guidId | jq .Parameter.Value)
clientId=$(aws ssm get-parameter --name talk-a-bot_clientId | jq .Parameter.Value)

node app.js
