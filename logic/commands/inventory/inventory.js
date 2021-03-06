const config = require("../../../config.js");
const fs = require("fs");
const bot = require(config.DIRNAME + "/main.js");
const { User, Hero, Op , Item} = require(config.LOGIC + "/helpers/DB.js");
require("./items.js");
require("./consumables.js");
require("./materials.js");


const inventory = async (user_id, chat_id) => {
    const opts = {
        reply_markup: {
            resize_keyboard: true,
            keyboard: [
                [
                    "๐ก๏ธ Objetos ",
                    " Consumibles ๐งช"
                ],
                [
                    "โ๏ธ Materiales ",
                    " Trabajo ๐ ๏ธ"
                ], 
                [
                    " Atrรกs โฉ๏ธ"
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

    const coins_str = {
        gold: "๐ฐ Oro",
        honor: "โ๏ธ Honor",
        conquest: "๐ฑ Conquista",
        heroism: "๐ฐ Heroรญsmo",
        gems: "๐ Gemas"
    };

    const inv = JSON.parse(hero.inventory);
    const coins = JSON.parse(hero.coins);

    let str = "๐ *Inventario:* \n\n" +
        "๐ Bolsas: *" + inv.bags + "* \n\n" +
        "๐ *Monedas:*";

    for (let c in coins_str) {
        str += "\n" + coins_str[c] + ": *" + coins[c] + "*";
    }

    bot.sendMessage(chat_id, str, opts);
};

bot.onText(/(\/inventory|๐ Inventario)/, async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;

    inventory(user_id, chat_id);
});

module.exports = inventory;
