const config = require("./config.js");

const TelegramBot = require('node-telegram-bot-api'); 
const bot = new TelegramBot(config.TOKEN, {polling: true}); 

module.exports = bot;
require(config.LOGIC + "/router.js");
