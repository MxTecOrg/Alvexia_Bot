const config = require("../../../../config.js");
const fs = require("fs");
const bot = require(config.DIRNAME + "/main.js");
const { User, Hero, Op } = require(config.LOGIC + "/helpers/DB.js");
const { getCity } = require(config.LOGIC + "/engine/map.js");
require("./pve");
require("./pvp");

const shop = async (user_id, chat_id) => {
    const opts = {
        reply_markup: {
            resize_keyboard: true,
            keyboard: [
                [
                    "âï¸ Tienda PvE ",
                    " Tienda PvP ð±"
                ],
                [
                    "ðï¸ Ciudad",
                    "AtrÃ¡s â©ï¸"
                ]
            ]
        },
        parse_mode: "Markdown"
    };

    const hero = await Hero.findOne({
        where: {
            user_id: user_id
        }
    });

    if (!hero) return bot.sendMessage(chat_id, "Esta cuenta no existe , use el comando /start para crear una.");

    const menu_str = "ðª *Tienda:*";
    bot.sendMessage(chat_id, menu_str, opts);
};

bot.onText(/(\/shop|Tienda ðª)/, async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;

    shop(user_id, chat_id);
});

module.exports = shop;
