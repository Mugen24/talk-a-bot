#!/bin/bash

token=$(aws ssm get-parameter --with-decryption --name talk-a-bot-token | jq .Parameter.Value) guildId=$(aws ssm get-parameter --with-decryption --name talk-a-bot_guidId | jq .Parameter.Value) clientId=$(aws ssm get-parameter --with-decryption --name talk-a-bot_clientId | jq .Parameter.Value) node loadCred.js &

