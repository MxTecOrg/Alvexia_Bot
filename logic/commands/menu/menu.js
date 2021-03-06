const config = require("../../../config.js");
const fs = require("fs");
const bot = require(config.DIRNAME + "/main.js");
const { User, Hero, Op , Party , Guild } = require(config.LOGIC + "/helpers/DB.js");
const {getEnergyTime} = require(config.LOGIC + "/engine/attr_calc.js");
const {getCity} = require(config.LOGIC + "/engine/map.js");
const level_db = JSON.parse(fs.readFileSync(config.DB + "/level_db.json"));

const menu = async (user_id, chat_id) => {
    const opts = {
        reply_markup: {
            resize_keyboard: true,
            keyboard: [
                [
                    "๐ Expediciรณn ",
                    " Quests ๐บ๏ธ"
                ],
                [
                    "๐๏ธ Ciudad ",
                    " Estado ๐ค"
                ],
                [
                    "๐ Inventario ",
                    " Social ๐ฌ"
                ],
                [
                    "๐ Comunidad ",
                    " Ajustes โ๏ธ"
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
    let hparty , hcastle;
    if(hero.party != "na"){
        hparty = await Party.findOne({
            where: {
                party_id : hero.party
            }
        });
    }
    if (hero.castle != "na") {
        hguild = await Castle.findOne({
            where: {
                castle_id: hero.castle
            }
        });
    }

    const menu_str = "๐ค *Estado:* \n\n" +
    "๐ค Heroe: _" + hero.nickname + "_ \n" +
    "โก Energia: *" + hero.energy + "/" + hero.max_energy + (eTime ? "(+1โก " + (eTime / 1000 / 60) + "m)" : "") + "*\n" +
    "๐ Nivel: *" + hero.level + "* \n" +
    "๐ง? XP: *" + hero.xp + "/" + level_db[hero.level - 1] + "*\n" +
    "โฅ๏ธ : *" + hero.hp + "/" + attr.stats.hp + " * \t" +
    "๐ท : *" + hero.mp + "/" + attr.stats.mp + "*\n" +
    "๐บ๏ธ Zona:* " + getCity( hero.zone ).name + "*\n" +
    "๐น๏ธ Estado:* " + hero.status + "\n*" +
    "๐ฅ Grupo: *" + (hparty ? hparty.name : "Ninguno") + "* \n" +
    "๐ฐ Castillo: *" + (hcastle ? castle.name : "Ninguno");
    bot.sendMessage(chat_id, menu_str, opts);
};

bot.onText(/(\/menu|Atrรกs โฉ๏ธ|โฉ๏ธ Atrรกs)/, async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;

    menu(user_id, chat_id);
});

module.exports = menu;
