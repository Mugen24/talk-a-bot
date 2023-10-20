"use strict"
// Require the necessary discord.js classes
const fs = require("node:fs");
const path = require("node:path");
const { REST, Routes } = require('discord.js');
const { Client, Events, Collection, GatewayIntentBits } = require('discord.js');
const { translate } = require("./utils.js");
let SPECIAL_CHAR = ":";

function main(token, clientId, guildId) {
        // Create a new client instance
        const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] });

        // When the client is ready, run this code (only once)
        // We use 'c' for the event parameter to keep it separate from the already defined 'client'
        client.once(Events.ClientReady, c => {
            console.log(`Ready! Logged in as ${c.user.tag}`);
        });

        // Log in to Discord with your client's token
        client.login(token);
        client.commands = new Collection();

        const commandPath = path.join(__dirname, "commands");
        const commandFiles = fs.readdirSync(commandPath).filter(file => file.endsWith("js"));
        for (const commandFile of commandFiles) {
            const filePath = path.join(commandPath, commandFile);
            const command = require(filePath);
            if ("data" in command && "execute" in command){
                client.commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }

        client.on(Events.InteractionCreate, async interaction => {
                if (!interaction.isChatInputCommand()) return;

                const command = interaction.client.commands.get(interaction.commandName);

                if (!command) {
                    console.error(`No command matching ${interaction.commandName} was found.`);
                    return;
                }

                try {
                    await command.execute(interaction);
                } catch (error) {
                    console.error(error);
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                    } else {
                        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                    }
                }
        });

        client.on(Events.MessageCreate, message => {
                const content = message.content;
                const regexOb = new RegExp(`^${SPECIAL_CHAR}\\w+`, 'g');
                const command_trigger = content.match(regexOb)?.pop();
                console.log(content);
                console.log(command_trigger);

                if (command_trigger === undefined) return;

                const message_content = content.slice(command_trigger.length, content.length).trim();

                console.log(message_content);
                const command = client.commands.get(command_trigger.slice(1,command_trigger.length));

                message._param = message_content;
                command?.execute(message);
        })



        const rest = new REST().setToken(token);
        (async () => {
            const commands = [...client.commands.values()].map(commandDesc => commandDesc.data);
            try {
                console.log(`Loading: ${commands.length} commands`);
                const data = await rest.put(
                        Routes.applicationGuildCommands(clientId, guildId),
                        {body: commands}
                        )
                console.log(`Successfully reloaded ${data.length} application (/) commands.`);
            } catch(error) {
                console.log(error);
            }
         })()
};



module.exports = {main};
