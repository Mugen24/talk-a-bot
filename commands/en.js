const { SlashCommandBuilder, SlashCommandStringOption} = require("discord.js");
const { translate } = require("../utils");
//

const stringOption = new SlashCommandStringOption()
                  .setName("text")
                  .setDescription("English text")
                  .setRequired(true)
        
module.exports = {
    data: new SlashCommandBuilder()
              .setName("en")
              .setDescription("Translate from Japanese to English")
              .addStringOption(stringOption),
    async execute(interaction){
        const text = interaction.options.get("text")?.value?.toString();
        const translation = await(translate("ja", "en", text));
        await interaction.reply(`Japanese: ${text} \nEnglish: ${translation}`);
    },
}
