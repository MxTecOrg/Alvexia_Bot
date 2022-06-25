/* Base Config */
const config = {
    URL: "https://t.me/Alvexia_Text_Bot",
    PORT: process.env.PORT || 8081, //port
    DIRNAME: __dirname, //root folder
    DB: __dirname + "/database", //database
    LOGIC: __dirname + "/logic", //logic 
    TOKEN: "5433703198:AAGdc11bgpo-oWxPeAfcQf0pjJ7idEikQ80" ,
    SERVER: { version: "v0.0.1" },
    ARENA: {
        createCost: 100,
        initalRating: 0,
        callDifference: 125
    },
    REFERRAL: {
        gems: 5
    },
    PA_LVL : 5
};

module.exports = config;
