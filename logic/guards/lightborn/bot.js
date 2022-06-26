const config = require("../../../config.js");

const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(config.GUARDS.lightborn.token, { polling: true });

const { User, Hero, Op } = require(config.LOGIC + "/helpers/DB.js");

/* Implementar
bot.on();

*/
