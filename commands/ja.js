const { SlashCommandBuilder, SlashCommandStringOption } = require("discord.js");
const { setExecuteParam }= require("./baseLanguageHandler");

//
const stringOption = new SlashCommandStringOption()
  .setName("text")
  .setDescription("Japanese text")
  .setRequired(true);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jp")
    .setDescription("Translate from English to Japanese")
    .addStringOption(stringOption),
  execute: (baseInteraction) => {
    const execute = setExecuteParam(
      "en",
      "ja",
      (text, translation) => `English: ${text}\nJapanese: ${translation}`,
    );
    execute(baseInteraction);
  },
};
