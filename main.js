const config = require("./config.js");

const TelegramBot = require('node-telegram-bot-api'); 
const bot = new TelegramBot(config.TOKEN, {polling: true}); 
const quests = require(config.LOGIC + "/engine/quests.js");
const map = require(config.LOGIC + "/engine/map.js");

map.loadMap();
map.loadDungeons();

quests.load();

module.exports = bot;
require(config.LOGIC + "/router.js");

/* Guards */
require(config.LOGIC + "/guards/guards.js");
