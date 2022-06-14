const config = require("../../../config.js");
const fs = require("fs");
const bot = require(config.DIRNAME + "/main.js");
const { User, Hero, Op } = require(config.LOGIC + "/helpers/DB.js");
const quests = require(config.LOGIC + "/engine/quests.js");

bot.onText(/(\/quests|Quests 🗺️)/, async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;

    quests.activeQuests(user_id , chat_id);
});

module.exports = quests;
