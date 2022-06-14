const config = require("./config.js");

const TelegramBot = require('node-telegram-bot-api'); 
const bot = new TelegramBot(config.TOKEN, {polling: true}); 
const quests = require(config.LOGIC + "/engine/quests.js");

quests.load();

module.exports = bot;
require(config.LOGIC + "/router.js");
