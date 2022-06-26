const config = require("../../../config.js");
const fs = require("fs");
const bot = require(config.DIRNAME + "/main.js");
const { User, Hero, Op } = require(config.LOGIC + "/helpers/DB.js");
require("./party/party.js");
require("./castle/castle.js");
require("./friends.js");

const social = async (user_id, chat_id) => {
    const opts = {
        reply_markup: {
            resize_keyboard: true,
            keyboard: [
                [
                    "👥 Grupo ",
                    " Castillo 🏰"
                ],
                [
                    "🧙🏻‍♂️ Amigos",
                    "Atrás ↩️"
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

    const menu_str = "💬 *Social:*";
    bot.sendMessage(chat_id, menu_str, opts);
};

bot.onText(/(\/social|Social 💬|💬 Social)/, async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;

    social(user_id, chat_id);
});

module.exports = social;
