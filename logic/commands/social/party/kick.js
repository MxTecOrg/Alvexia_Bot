const config = require("../../../../config.js");
const fs = require("fs");
const bot = require(config.DIRNAME + "/main.js");
const { User, Hero, Op , Party } = require(config.LOGIC + "/helpers/DB.js");

const kick = async (user_id, chat_id , ute) => {
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
    
    if(party.owner != user_id) return bot.sendMessage(chat_id , "Debes ser el lider del grupo para poder expulsar a un miembro.");
    
    if(party.status != "rest") return bot.sendMessage(chat_id , "El grupo debe encontrarse descansando para poder expulsar a un miembro.");
    
    if(!ute || ute == user_id) return;
    
    if(!members.includes(ute)) return bot.sendMessage(chat_id , "El miembro indicado no se encuentra en el grupo");
    
    members.splice(members.indexOf(ute) , 1);
    
    const _ute = await Hero.findOne({
        where : {
            user_id : ute
        }
    });
    
    const __ute = await User.findOne({
        where: {
            user_id: ute
        }
    })
    
    if(!_ute) return;
    
    await _ute.setData({
        party : "na"
    });
    
    await party.setData({
        members : members
    });
    
    bot.sendMessage(__ute , "Has sido expulsado del grupo");
    
    for(let m of members){
        const mem = await User.findOne({
            where: {
                user_id : m
            }
        });
        
        bot.sendMessage(mem.chat_id , "El heroe '" + _ute.nickname + "' a sido expulsado del grupo");
    }

    const menu_str = "Has expulsado a '" + h.nickname + "'";
    bot.sendMessage(chat_id, menu_str, opts);
};

bot.onText(/^\/lkick.*/, async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;

    kick(user_id, chat_id , data.text.split("_")[1]);
});

module.exports = kick;
