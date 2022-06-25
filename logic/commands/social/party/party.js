const config = require("../../../../config.js");
const fs = require("fs");
const bot = require(config.DIRNAME + "/main.js");
const { User, Hero, Op , Party } = require(config.LOGIC + "/helpers/DB.js");
require("./join.js");
require("./create.js");
require("./leave.js");
require("./chat.js");

const party = async (user_id, chat_id) => {
    const opts = {
        reply_markup: {
            resize_keyboard: true,
            keyboard: [
                [
                    "🔍 Unirse a Grupo",
                    " Crear Grupo 📝"
                ],
                [
                    "💬 Social",
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
    
    const _party = await Party.findOne({
        where: {
            party_id : hero.party
        }
    });
    

    const menu_str = "👥 *Grupo:*\n\n" + 
    "👥 : *" + (_party ? _party.name : "Ninguno") + "*" +
    (_party ? "\n♥️ Estado : /sparty" : "");
    bot.sendMessage(chat_id, menu_str, opts);
};

bot.onText(/(\/party|👥 Grupo)/, async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;

    party(user_id, chat_id);
});

module.exports = party;
