const config = require("../../../../config.js");
const fs = require("fs");
const bot = require(config.DIRNAME + "/main.js");
const { User, Hero, Op , Party } = require(config.LOGIC + "/helpers/DB.js");
const { getCity } = require(config.LOGIC + "/helpers/map.js");

const chat = async (user_id, chat_id , text) => {
    const opts = {
        parse_mode: "Markdown"
    };

    const hero = await Hero.findOne({
        where: {
            user_id: user_id
        }
    });

    if (!hero) return bot.sendMessage(chat_id, "Esta cuenta no existe , use el comando /start para crear una.");
    
    const party = await Party.findOne({
        where: {
            party_id : hero.party
        }
    });
    
    if(!party) return bot.sendMessage(chat_id , "No te encuentras en ningun grupo");
    
    const members = JSON.parse(party.members);
    
    for(let mem of members){
        if(mem == user_id) continue;
        const h = await User.findOne({
            where: {
                user_id : mem
            }
        });
        if(!h) continue;
        bot.sendMessage(h.chat_id, "'" + hero.nickname + "': " + text);
    }
};

bot.onText(/^\/pch .*/, async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;

    chat(user_id, chat_id , data.text.replace("/pch" , ""));
});

module.exports = chat;
