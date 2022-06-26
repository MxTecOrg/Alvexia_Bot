const config = require("../../../config.js");
const fs = require("fs");
const bot = require(config.DIRNAME + "/main.js");
const { User, Hero, Op } = require(config.LOGIC + "/helpers/DB.js");

const friends = async (user_id, chat_id) => {
    const opts = {
        
    };

    const hero = await Hero.findOne({
        where: {
            user_id: user_id
        }
    });

    if (!hero) return bot.sendMessage(chat_id, "Esta cuenta no existe , use el comando /start para crear una.");
    
    const fri = JSON.parse(hero.friends).friends.length;
    

    const menu_str = "🧙🏻‍♂️ *Amigos:*\n\n" +
    "👥 Amigos Referidos: " + fri + "\n" +
    "🔗 Link de Referencia: " + config.URL + "?start=" + user_id + "\n" +
    "\nCada usuario referido que llegue a nivel 5 te otorgará  " + config.REFERRAL.gems + "💎";
    bot.sendMessage(chat_id, menu_str, opts);
};

bot.onText(/(\/friends|🧙🏻‍♂️ Amigos)/, async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;

    friends(user_id, chat_id);
});

module.exports = friends;
