const fs = require("node:fs");
const { BaseInteraction, Message, SlashCommandBuilder } = require("discord.js");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set-prefix")
    .setDescription("Modifies message prefix")
    .addStringOption((option) =>
      option.setName("text")
        .setDescription("One character Prefix")
        .setRequired(true)
    ),

  execute: async function (interaction) {
    let prefix;


    if (interaction instanceof BaseInteraction) {
        prefix = interaction.options.get("text")?.value?.toString();
    } else if (interaction instanceof Message) {
        prefix = interaction.content.match(/\s.+/g)?.pop()?.trim();
    }

    const creds = require("../config.json");
    creds.specialChar = prefix;
    console.log(creds);
    const configPath = path.resolve(__dirname, "../config.json");
    console.log(configPath);

    interaction.client.config["specialChar"] = prefix;

    if (prefix && prefix.length == 1) {
      interaction.reply("Updating prefix..");

      fs.writeFile(configPath, JSON.stringify(creds), (err) => {
        if (err) {
          interaction.reply("Unable to write to config file");
        }
      });
      interaction.reply("Prefix set");
    } else {
      interaction.reply("Please enter a 1 character prefix");
    }
  },
};
