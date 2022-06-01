/* Base Config */
const config = {
    URL: "https://mxtecorgalvexiabot.glitch.me",
    PORT: process.env.PORT || 8081, //port
    DIRNAME: __dirname, //root folder
    DB: __dirname + "/database", //database
    LOGIC: __dirname + "/logic", //logic 
    TOKEN: "5433703198:AAGdc11bgpo-oWxPeAfcQf0pjJ7idEikQ80" ,
    SERVER: { version: "v0.0.1" }
};

module.exports = config;
