"use strict"

const fs = require("node:fs");
const { REST, Routes } = require('discord.js');
const { Client, Events, GatewayIntentBits } = require('discord.js');
const { translate } = require("./utils.js");
const languages = require("./languages.js");
let { SPECIAL_CHAR, SOURCE_LANG, TARGET_LANG } = require("./config.json");

console.info("SPECIAL_CHAR:", SPECIAL_CHAR);
console.info("SOURCE_LANG:", SOURCE_LANG);
console.info("TARGET_LANG:", TARGET_LANG);

function setConfig(key, value) {
    const content = fs.readFileSync("config.json", {flag: 'r'});
    const json = JSON.parse(content);
    console.info("Setting:", key);
    console.info("Value:", value);

    if (key === "target") {
        key = "TARGET_LANG";
    }
    else if (key === "source") {
        key === "SOURCE_LANG";
    }

    if (key in json) {
        json[key] = value;
    } else {
        throw new Error(`Invalid config: value ${key} does not exists`);
    }
    fs.writeFileSync("config.json", JSON.stringify(json));
}


function main(token, clientId, guildId) {
        // Create a new client instance
        const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] });
        const languageCodes = Object.keys(languages);
        console.debug(languageCodes);

        // When the client is ready, run this code (only once)
        // We use 'c' for the event parameter to keep it separate from the already defined 'client'
        client.once(Events.ClientReady, c => {
            console.log(`Ready! Logged in as ${c.user.tag}`);
        });

        // Log in to Discord with your client's token
        client.login(token);


        const langCodeOps = languageCodes.map(
                co => {
                    return {
                        "name": co,
                        "value": co
                    }
                }
            )

        console.debug(langCodeOps);
        client.commands = [
            {
                "name": "source",
                "description": "Set source language",
                "options": [
                    {
                        "name": "text",
                        "type": 3,
                        "description": "language code",
                        "required": true,
                        "choices": langCodeOps,
                    }
                ]
            }, 
            {
                "name": "target",
                "description": "Set target language",
                "options": [
                    {
                        "name": "text",
                        "type": 3,
                        "description": "Language code",
                        "required": true,
                        "choices": langCodeOps,

                    }
                ]
            },
            {
                "name": "list-languages",
                "description": "List legal language code",
            },
            {
                "name": "trans",
                "description": "Tranlsate from target to source",
                "options": [
                    {
                        "name": "text",
                        "description": "Text to translate",
                        "type": 3,
                        "required": true
                    }
                ]
            }
            
        ]
            
        
        client.commands = [...client.commands];

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
                const commandName = interaction.commandName;
                if (!interaction.isChatInputCommand()) return;

                else if (commandName === "target") {
                    TARGET_LANG = interaction.options?.getString("text");
                    try {
                        setConfig("target", TARGET_LANG);
                        interaction.reply("Updated target sucessfully");
                    } catch(error) {
                        interaction.reply(error.toString());
                    } 

                    return;
                }

                else if (commandName === "source") {
                    SOURCE_LANG = interaction.options?.getString("text");
                    try {
                        setConfig("source", SOURCE_LANG);
                        interaction.reply("Updated source sucessfully");
                    } catch(error) {
                        interaction.reply(error.toString());
                    } 
                    return;
                }


                else if (commandName === "trans") {
                    if (!TARGET_LANG || !SOURCE_LANG) {
                        interaction.reply("Please specify a /source and a /target. Run /list-languages to find more language");
                        return;
                    } else {
                        const content = interaction.options.getString("text");
                        if (content) {
                            const data = await translate(SOURCE_LANG, TARGET_LANG, content);
                            interaction.reply(data);
                        } else {
                            interaction.reply("Nothing to translate xsxd");
                        }


                    }

                }

                else if (commandName === "list-languages") {
                    interaction.reply(
                            {content: `${languageCodes.reduce((a,b) => a.concat(` ${b}`))}`,
                             ephemeral: true,
                            }
                    );
                }


        });


        client.on(Events.MessageCreate, async message => {
                if (message.isChatInputCommand) return;
                if (message.author.bot) return;
                const content = message.content;
                const regexOb = new RegExp(`(^${SPECIAL_CHAR})([\\w\\s]+)`);
                const commandComponent = content.match(regexOb);
                console.log(SPECIAL_CHAR);
                console.log(content);
                console.log(commandComponent || "Null");

                if (commandComponent[1] === undefined) return;
                    if (commandComponent[2] !== undefined) {
                        const data = await translate(SOURCE_LANG, TARGET_LANG, commandComponent[2]);
                        if (data) {
                            message.reply(data);
                        } else {
                            message.reply("pep pop language undefined system down Zzz");
                        }
                    }
        })
};



module.exports = {main};
