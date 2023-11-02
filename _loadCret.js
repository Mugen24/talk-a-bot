const fs = require("node:fs");
const { main }= require("./app.js");

fs.stat('config.json', function (err, _stat) {
    let token;
    let clientId;
    let guildId;
    if (err == null){
        ({ token, clientId, guildId } = require('./credential.json'));
    } else {
        token = process.env.token.replace(/^"+|"+$/g, '');
        clientId = process.env.clientId.replace(/^"+|"+$/g, '');
        guildId = process.env.guildId.replace(/^"+|"+$/g, '');
    }

    if (token === undefined) {
        console.log("Token is not defined");
        process.exit(0);
    }

    main(token, clientId, guildId);



})
