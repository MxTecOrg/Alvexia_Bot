const config = require("../../../config.js");
const fs = require("fs");
const bot = require(config.DIRNAME + "/main.js");
const { User, Hero, Op , Item} = require(config.LOGIC + "/helpers/DB.js");


const inventory = async (user_id, chat_id) => {
    const opts = {
        reply_markup: {
            resize_keyboard: true,
            keyboard: [
                [
                    "🛡️ Objetos ",
                    " Consumibles 🧪"
                ],
                [
                    "⛏️ Materiales ",
                    " Trabajo 🛠️"
                ], 
                [
                    " Atrás ↩️"
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
        gold: "💰 Oro",
        honor: "⚔️ Honor",
        conquest: "🔱 Conquista",
        heroism: "🔰 Heroísmo",
        gems: "💎 Gemas"
    };

    const inv = JSON.parse(hero.inventory);
    const coins = JSON.parse(hero.coins);

    let str = "🎒 *Inventario:* \n\n" +
        "👝 Bolsas: *" + inv.bags + "* \n\n" +
        "🔖 *Monedas:*";

    for (let c in coins_str) {
        str += "\n" + coins_str[c] + ": *" + coins[c] + "*";
    }

    bot.sendMessage(chat_id, str, opts);
};

bot.onText(/(\/inventory|🎒 Inventario)/, async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;

    inventory(user_id, chat_id);
});

module.exports = inventory;
