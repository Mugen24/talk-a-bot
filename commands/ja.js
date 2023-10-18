const { SlashCommandBuilder, SlashCommandStringOption} = require("discord.js");
const { translate } = require("../utils");
//

const stringOption = new SlashCommandStringOption()
                  .setName("text")
                  .setDescription("Japanese text")
                  .setRequired(true)
        
module.exports = {
    data: new SlashCommandBuilder()
              .setName("jp")
              .setDescription("Translate from English to Japanese")
              .addStringOption(stringOption),
    async execute(interaction){
        const text = interaction.options.get("text")?.value?.toString();
        const translation = await(translate("en", "ja", text));
        await interaction.reply(`English: ${text} \nJapanese: ${translation}`);
    },
}
