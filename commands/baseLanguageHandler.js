//customReplyFunc(originalText, translation)
//Return a string for bot to reply
const { translate } = require("../utils");
const { BaseInteraction, Message } = require("discord.js");
function setExecuteParam(sl, tl, customReplyFunc) {
  return async function execute(event) {
    if (event instanceof BaseInteraction) {
      console.log("In base Interaction: ");
      const interaction = event;
      const text = interaction.options.get("text")?.value?.toString();
      const translation = await (translate(sl, tl, text));
      interaction.reply(customReplyFunc(text, translation));
    } else if (event instanceof Message) {
      console.log("In Message: ");
      const message = event;
      console.log(message._param);
      const translation = await (translate(sl, tl, message._param));
      message.reply(customReplyFunc(message._param, translation));
    }
  };
}

module.exports = { setExecuteParam };
