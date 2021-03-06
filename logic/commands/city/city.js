const config = require("../../../config.js");
const fs = require("fs");
const bot = require(config.DIRNAME + "/main.js");
const { User, Hero, Op } = require(config.LOGIC + "/helpers/DB.js");
const { getCity } = require(config.LOGIC + "/engine/map.js");
require("./dungeons.js");
require("./arena/arena.js");
require("./shop/shop.js");
require("./travel.js");
require("./tabern/tabern.js");

const city = async (user_id, chat_id) => {
    const opts = {
        reply_markup: {
            resize_keyboard: true,
            keyboard: [
                [
                    "ποΈ Mazmorras ",
                    " Arena ποΈ"
                ],
                [
                    "π€ Taberna ",
                    " Tienda πͺ"
                ],
                [
                    "π Se busca ",
                    " Viajar πΊοΈ"
                ],
                [
                    "AtrΓ‘s β©οΈ"
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

    const zone = getCity(hero.zone);

    const menu_str = "ποΈ *Ciudad*: \n\n" +
        "π§Ύ Nombre: *" + zone.name + "* \n" +
        "_" + zone.desc + "_\n\n" +
        "π² Bosque: *" + zone.level.min + " - " + zone.level.max + " lvl*";
    bot.sendMessage(chat_id, menu_str, opts);
};

bot.onText(/(\/city|ποΈ Ciudad)/, async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;

    city(user_id, chat_id);
});

module.exports = city;
