const config = require("../../../../config.js");
const fs = require("fs");
const bot = require(config.DIRNAME + "/main.js");
const { User, Hero, Op , Castle} = require(config.LOGIC + "/helpers/DB.js");

const castle = async (user_id, chat_id) => {
    const opts = {
        reply_markup: {
            resize_keyboard: true,
            keyboard: [
                [
                    "🔍 Unirse a un Castillo",
                    " Crear Castillo 📝"
                ],
                [
                    "↩️ Atrás"
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

    const menu_str = "🏰 *Castillo:*";
    bot.sendMessage(chat_id, menu_str, opts);
};

bot.onText(/(\/castle|Castillo 🏰)/, async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;

    castle(user_id, chat_id);
});

module.exports = castle;
