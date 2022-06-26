const config = require("../../../../config.js");
const fs = require("fs");
const bot = require(config.DIRNAME + "/main.js");
const { User, Hero, Op , Party } = require(config.LOGIC + "/helpers/DB.js");

const leave = async (user_id, chat_id) => {
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
    
    if(party.status != "rest") return bot.sendMessage(chat_id , "El grupo debe encontrarse descansando para poder abandonarlo.");
    
    if(members.length == 1){
        party.destroy();
    }else if(party.owner == user_id){
        members.splice(members.indexOf(user_id) , 1);
        party.setData({
            members : members,
            owner: members[Math.floor(Math.random() * members.length)]
        });
    }else{
        members.splice(members.indexOf(user_id), 1);
        party.setData({
            members: members
        });
    }
    
    hero.setData({
        party: "na"
    });
    
    for(let m of members){
        const mem = await User.findOne({
            where: {
                user_id : m
            }
        });
        bot.sendMessage(chat_id , "El heroe '" + hero.nickname + "' a dejado el grupo.");
    }

    const menu_str = "Has dejado el grupo";
    bot.sendMessage(chat_id, menu_str, opts);
};

bot.onText(/\/lparty/, async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;

    leave(user_id, chat_id);
});

module.exports = leave;
