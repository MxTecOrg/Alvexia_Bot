const config = require("../../../../config.js");
const fs = require("fs");
const bot = require(config.DIRNAME + "/main.js");
const { User, Hero, Op , Party } = require(config.LOGIC + "/helpers/DB.js");
const { getCity } = require(config.LOGIC + "/engine/map.js");

const status = async (user_id, jb) => {
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
    
    if(!party && jb) return bot.sendMessage(chat_id , "No te encuentras en ningun grupo");
    
    const members = JSON.parse(party.members);
    
    let leader;
    if(party.owner == user_id) leader = hero.nickname;
    else {
        let n = await Hero.findOne({
            where: {
                user_id : party.owner
            }
        });
        if(n) leader = n.nickname;
        else leader = "Nadie";
    }

    let menu_str = "♥️ *Estado del Grupo:*\n\n" +
    "📝 Nombre: *" + party.name + "*\n" +
    "🆔 : `" + party.party_id + "` \n" +
    "👑 Lider: _" + leader + "_ \n" +
    "🕹️ Estado: *" + party.status + "* \n" +
    "🗺️ Zona: *" + getCity( party.zone).name + "* \n" ;
    if(jb) return {msg : menu_str , opts};
    menu_str += "👥 *Miembros (" + members.length + "/15) :\n";
    
    for(let mem of members){
        const h = await Hero.findOne({
            where: {
                user_id : mem
            }
        });
        if(!h) continue;
        const attr = h.getAttrData();
        menu_str += "\n👤 Heroe: *" + h.nickname + "* \t🆙: *" + h.level + "*\n" +
        "♥️: *" + h.hp + "/" + attr.stats.hp + " \t 🔷: *" + h.mp + "/" + attr.stats.mp + "* \n" +
        (party.owner == user_id && mem != user_id ? "🚪 Expulsar: /kparty_" + mem + "\n" : "");
    }
    
    return {msg : menu_str , opts};
};

bot.onText(/\/sparty/, async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;

    const {msg , opts} = await status(user_id);
    bot.sendMessage(chat_id , msg , opts);
});

module.exports = status;
