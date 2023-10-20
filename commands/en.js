const { SlashCommandBuilder, SlashCommandStringOption} = require("discord.js");
const { setExecuteParam } = require("./baseLanguageHandler");

const stringOption = new SlashCommandStringOption()
                  .setName("text")
                  .setDescription("English text")
                  .setRequired(true)
        
module.exports = {
    data: new SlashCommandBuilder()
              .setName("en")
              .setDescription("Translate from Japanese to English")
              .addStringOption(stringOption),
    execute: (baseInteraction) => {
        const execute = setExecuteParam("ja", "en", (text, translation) => `Japanese: ${text}\nEnglish: ${translation}`)
        execute(baseInteraction);
    },
}
