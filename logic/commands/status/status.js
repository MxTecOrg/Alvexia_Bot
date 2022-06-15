const config = require("../../../config.js");
const fs = require("fs");
const bot = require(config.DIRNAME + "/main.js");
const { User, Hero, Op } = require(config.LOGIC + "/helpers/DB.js");

const {getEnergyTime} = require(config.LOGIC + "/engine/attr_calc.js");
const level_db = JSON.parse(fs.readFileSync(config.DB + "/level_db.json"));

const menu = async (user_id, chat_id) => {
    const opts = {
        reply_markup: {
            resize_keyboard: true,
            keyboard: [
                [
                    "👤 Estado ",
                    " Equipo 🛡️"
                ],
                [
                    "🔥 Habilidades ",
                    " Trabajo ⚒️"
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

bot.onText(/(\/status| Estado 👤)/, async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;

    menu(user_id, chat_id);
});

module.exports = menu;
