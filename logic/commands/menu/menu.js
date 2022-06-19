const config = require("../../../config.js");
const fs = require("fs");
const bot = require(config.DIRNAME + "/main.js");
const { User, Hero, Op } = require(config.LOGIC + "/helpers/DB.js");
const {getEnergyTime} = require(config.LOGIC + "/engine/attr_calc.js");
const {getCity} = require(config.LOGIC + "/engine/map.js");
const level_db = JSON.parse(fs.readFileSync(config.DB + "/level_db.json"));

const menu = async (user_id, chat_id) => {
    const opts = {
        reply_markup: {
            resize_keyboard: true,
            keyboard: [
                [
                    "🔍 Expedición ",
                    " Quests 🗺️"
                ],
                [
                    "🏘️ Ciudad ",
                    " Estado 👤"
                ],
                [
                    "🎒 Inventario ",
                    " Social 💬"
                ],
                [
                    "💌 Comunidad ",
                    " Ajustes ⚙️"
                ]
            ]
        },
        parse_mode : "Markdown"
    };

    const user = await User.findOne({
        where: {
            user_id: user_id
        }
    });

    const hero = await Hero.findOne({
        where: {
            user_id: user_id
        }
    });

    if (!user || !hero) return bot.sendMessage(chat_id, "Esta cuenta no existe , use el comando /start para crear una.");
    
    const attr = hero.getAttrData();
    const eTime = getEnergyTime(user_id);

    const menu_str = "👤 Estado 👤 \n\n" +
    "👤 Heroe: _" + hero.nickname + "_ \n" +
    "⚡ Energia: *" + hero.energy + "/" + hero.max_energy + (eTime ? "(+1⚡ " + (eTime / 1000 / 60) + "m)" : "") + "*\n" +
    "🆙 Nivel: *" + hero.level + "* \n" +
    "🧠 XP: *" + hero.xp + "/" + level_db[hero.level - 1] + "*\n" +
    "♥️ Salud: *" + hero.hp + "/" + attr.stats.hp + " * \n" +
    "🔷 Mana: *" + hero.mp + "/" + attr.stats.mp + "*\n" +
    "🗺️ Zona:* " + getCity( hero.zone ).name + "*\n" +
    "🕹️ Estado:* " + hero.status + "\n*" +
    "👾 Grupo: *" + (hero.party != "na" ? hero.party : "Ninguno") + "* \n";
    bot.sendMessage(chat_id, menu_str, opts);
};

bot.onText(/(\/menu|Atrás ↩️)/, async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;

    menu(user_id, chat_id);
});

module.exports = menu;
