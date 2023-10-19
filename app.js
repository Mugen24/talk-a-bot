"use strict"
// Require the necessary discord.js classes
const fs = require("node:fs");
const path = require("node:path");
const { REST, Routes } = require('discord.js');
const { Client, Events, Collection, GatewayIntentBits } = require('discord.js');
//const { token, clientId, guildId} = require('./config.json');
const token = process.env.token;
const clientId = process.env.clientId;
const guildId = process.env.guildId;
console.log("token");
console.log(token);
console.log("clientId");
console.log(clientId);
console.log("guildId");
console.log(guildId);
const { translate } = require("./utils.js");

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

client.on(Events.MessageCreate, async message => {
        const content = message.content;
        const command = content.slice(0,3);
        const message_content = content.slice(3, content.length).trim();

        console.log(message_content);
        try {
            if (command === ":jp"){
                const translated = await translate("en", "ja", message_content);
                message.reply(`English: ${message_content}\nJapanese: ${translated}`);
            }

            else if (command === ":en"){
                const translated = await translate("ja", "en", message_content);
                message.reply(`Japanese: ${message_content}\nEnglish: ${translated}`);
            }
        } catch(error) {
            console.log(`${error} has occured`);
            message.reply("Something went wrong please wait a moment and retry")
        }

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

