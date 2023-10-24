"use strict"
// Require the necessary discord.js classes
const fs = require("node:fs");
const path = require("node:path");
const { REST, Routes } = require('discord.js');
const { Client, Events, Collection, GatewayIntentBits } = require('discord.js');
const { translate, eventTranslateHandlder } = require("./utils.js");
const languages = require("./languages.js");
let {SPECIALCHAR, SOURCE, TARGET} = require("config.json");

function setConfig(key, value) {
    const content = fs.readFileSync("config.json", {flag: 'r'});
    const json = Json.load(content);
    if (key in Object.keys(json)) {
        json.key = value;
    } else {
        console.log(`Invalid config: value ${key} does not exists`);
    }

    fs.writeFile("config.json", Json.stringify(json));

}

async function handleError(command, args) {
    try {
        await command(...args);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
}


async function main(token, clientId, guildId) {
        // Create a new client instance
        const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] });
        const languageCodes = languageCodes;

        // When the client is ready, run this code (only once)
        // We use 'c' for the event parameter to keep it separate from the already defined 'client'
        client.once(Events.ClientReady, c => {
            console.log(`Ready! Logged in as ${c.user.tag}`);
        });

        // Log in to Discord with your client's token
        client.login(token);
        client.commands = [
            {
                "name": "source",
                "description": "Set source language",
                "stringOption": [
                    {
                        "name": "text",
                        "description": "language code"
                    }
                ]
            }, 
            {
                "name": "target",
                "description": "Set target language",
                "stringOption": [
                    {
                        "name": "text",
                        "description": "Language code"
                    }
                ]
            },
            {
                "name": "list-languages",
                "description": "List legal language code",
                "stringOption": [{
                    "name": "text",
                    "decsription": "Language code"
                }]
            },
        ]
        //Register languages manually for explicit invocation
        client.commands.concat(languageCodes);

        const rest = new REST().setToken(token);
        (async () => {
            try {
                const data = await rest.put(
                        Routes.applicationGuildCommands(clientId, guildId),
                        {body: client.commands}
                        )
                console.log(`Successfully reloaded ${data.length} application (/) commands.`);
            } catch(error) {
                console.log(error);
            }
         })()

        

        client.on(Events.InteractionCreate, async interaction => {
                let commandName = interaction.commandName;
                if (!interaction.isChatInputCommand()) return;

                if (commandName === "target") {
                    setConfig("target", interaction);
                    TARGET = interaction.options?.getValue("text").content;
                    return;
                }

                if (commandName === "source") {
                    setConfig("source", interaction);
                    TARGET = interaction.options?.getValue("text").content;
                    return;
                }


                if (!TARGET || !SOURCE) {
                    interaction.reply("Please specify a /source and a /target. Run /list-languages to find more language");
                    return;
                }

                if (commandName === "list-languages") {
                    interaction.reply(languageCodes);
                }

                //Manually invoke translation into target language
                if (commandName in languageCodes) {
                    const translatedText = await handleError(eventLanguageHandler, commandName, TARGET, interaction);
                    interaction.reply(translatedText);

                } else {
                    interaction.reply(`Please enter the following languages only${[... languageCodes]}`);
                    return;
                }

        });


        client.on(Events.MessageCreate, async message => {
                const content = message.content;
                const regexOb = new RegExp(`^${SPECIAL_CHAR}\\w+`, 'g');
                const commandTrigger = content.match(regexOb)?.pop();
                console.log(content);
                console.log(commandTrigger);

                if (command_trigger === undefined) return;
                const translatedText = await handleError(eventTranslateHandlder, SOURCE, TARGET, message);
                message.reply(translateText);
        })



};



module.exports = {main};
