"use strict"

const fs = require("node:fs");
const { REST, Routes } = require('discord.js');
const { Client, Events, GatewayIntentBits } = require('discord.js');
const { translate } = require("./utils.js");
const languages = require("./languages.js");
let { SPECIAL_CHAR, SOURCE_LANG, TARGET_LANG , MODE } = require("./config.json");

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
        key = "SOURCE_LANG";
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
                "description": "Translate from target to source",
                "options": [
                    {
                        "name": "text",
                        "description": "Text to translate",
                        "type": 3,
                        "required": true
                    }
                ]
            },
            {
                "name": "mode",
                "description": "Setting translate mode [command | live]. DEFAULT = command",
                "options": [
                    {
                        "name": "text",
                        "description": "mode",
                        "type": 3,
                        "required": true,
                        "choices": [
                            {
                                "name": "Command",
                                "value": "command"
                            },
                            {
                                "name": "Live",
                                "value": "live"
                            },
                        ]
                    }
                ]
            },
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

                else if (commandName === "mode") {
                    const option = interaction.options.getString("text");
                    setConfig("MODE", option);
                    interaction.reply("Mode updated sucessfully");
                    MODE = option;
                }


        });


        client.on(Events.MessageCreate, async message => {
                if (message.isChatInputCommand) return;
                if (message.author.bot) return;

                if (MODE === "live") {
                    const translated = await translate(SOURCE_LANG, TARGET_LANG, message.content);
                    message.reply(translated);
                    return;
                }

                const content = message.content;
                const regexOb = new RegExp(`(^${SPECIAL_CHAR})(\\w+\\s)([\\w\\s]+)`);
                const commandComponent = content.match(regexOb);
                if (!commandComponent || commandComponent.length !== 4) return;

                const _special_char = commandComponent[1];
                let _langCode = commandComponent[2].trim();
                const _msg = commandComponent[3];

                console.log(_special_char);
                console.log(_langCode);
                console.log(_msg);

                if (_special_char === undefined) return;
                if (_langCode === undefined) return;
                if (_msg === undefined) return;

                if (_langCode == "jp") {
                    _langCode = "ja";
                }

                if (!(languageCodes.indexOf(_langCode) >= 0)) {
                    message.reply("Invalid language code. /list-languages for more");
                    return;
                }


                const data = await translate("auto", _langCode, _msg);
                if (data) {
                    message.reply(data);
                } else {
                    message.reply("pep pop language undefined system down Zzz");
                }
        })
};



module.exports = {main};
