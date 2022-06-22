const config = require("../../../../config.js");
const fs = require("fs");
const bot = require(config.DIRNAME + "/main.js");
const { User, Hero, Op } = require(config.LOGIC + "/helpers/DB.js");

const guild = async (user_id, chat_id) => {
    const opts = {
        reply_markup: {
            resize_keyboard: true,
            keyboard: [
                [
                    "🔍 Unirse",
                    " Crear 📝"
                ],
                [
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

    const menu_str = "🔰 *Gremio:*";
    bot.sendMessage(chat_id, menu_str, opts);
};

bot.onText(/(\/guild|Gremio 🔰)/, async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;

    guild(user_id, chat_id);
});

module.exports = guild;
