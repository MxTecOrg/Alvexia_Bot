const config = require("../../../config.js");
const fs = require("fs");
const bot = require(config.DIRNAME + "/main.js");
const { User, Hero, Op } = require(config.LOGIC + "/helpers/DB.js");

require("./h_status");
require("./equipment.js");
require("./pa.js");

const status = async (user_id, chat_id) => {
    const opts = {
        reply_markup: {
            resize_keyboard: true,
            keyboard: [
                [
                    "👤 Estadísticas ",
                    " Equipo 🛡️"
                ],
                [
                    "🔥 Habilidades ",
                    " PA 💡"
                ],
                [
                    " Atrás ↩️"
                ]
            ]
        },
        parse_mode : "Markdown"
    };

    const hero = await Hero.findOne({
        where: {
            user_id: user_id
        }
    });

    if (!hero) return bot.sendMessage(chat_id, "Esta cuenta no existe , use el comando /start para crear una.");

    const str = "👤 *Estado:*";
    bot.sendMessage(chat_id, str, opts);
};

bot.onText(/(\/status|Estado 👤)/, async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;

    status(user_id, chat_id);
});

module.exports = status;
