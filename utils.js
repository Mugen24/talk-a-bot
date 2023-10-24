const {BaseInteraction, Message } = require("discord.js");
async function translate(sl, tl, text) {
  const url = "https://translate.googleapis.com/translate_a/single?" +
    new URLSearchParams({
      // see https://stackoverflow.com/a/29537590 for more params
      // holy shidd nvidia
      client: "gtx",
      // source language
      sl: sl,
      // target language
      tl: tl,
      // what to return, t = translation probably
      dt: "t",
      // Send json object response instead of weird array
      dj: "1",
      source: "input",
      // query, duh
      q: text,
    });

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `Failed to translate "${text}" from ${sl} to ${tl}`,
    );
  }
  let { sentences } = await res.json();
  sentences = sentences.map((sen) => sen?.trans)
    .filter(Boolean)
    .join("");
  return sentences;
}

async function eventTranslateHandler(sl, tl, _event) {
    const content;
    if (_event instanceOf BaseInteraction) {
        content = _event.options?.getValues("text").content;
    }

    //
    if (_event instanceOf Message) {
        content = _event.content.match(\.+\s\g).pop()?.trim();
    }

    return translate(sl, tl, content);
}

module.exports = {
  eventTranslateHandler,
};
