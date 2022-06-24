const config = require("../../../../config.js");
const fs = require("fs");
const bot = require(config.DIRNAME + "/main.js");
const { User, Hero, Op, Party } = require(config.LOGIC + "/helpers/DB.js");
const uid = require(config.LOGIC + "/helpers/uid.js");

var setName = {};


const partyJoin = async (user_id) => {
    let opts = {
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: [
                [{ text: "📜 Unirse", callback_data: "party_team_join" }]
            ]
        }
    };

    const hero = await Hero.findOne({
        where: {
            user_id: user_id
        }
    });

    if (!hero) return { msg: "Esta cuenta no existe , use el comando /start para crear una." };


    const party = await Party.findOne({
        where: {
            party_id: hero.party
        }
    });

    if (party) {
        opts.reply_markup.inline_keyboard[0][0] = {
            text: "Atrás ↩️",
            callback_data: "party_create"
        };

        return { msg: "🧾 Se encuentra actualmente en un equipo. Para crear uno debe salir del equipo actual , puede dejar su equipo con el comando /ptleave" }

    }

    let msg = "📜 *Unirse a Equipo :*\n";

    return { msg, opts };
};

bot.on("callback_query", async (data) => {
    const user_id = data.from.id;
    const chat_id = data.message.chat.id;
    const mess_id = data.message.message_id;


    if (data.data == "party_join") {
        const {msg , opts} = await partyJoin(user_id);
        opts.chat_id = chat_id;
        opts.message_id = mess_id;
        bot.editMessageText(msg , opts);
    } else if (data.data == "party_team_join") {
        const {msg , opts} = await joinpartyTeam(user_id);
        opts.chat_id = chat_id;
        opts.message_id = mess_id;
        bot.editMessageText(msg, opts);
    }
});

const joinPartyTeam = async (user_id) => {
    const hero = await Hero.findOne({
        where: {
            user_id: user_id
        }
    });

    let opts = {
        parse_mode: "Markdown"
    }


    if (!hero) {
        return { msg: "Esta cuenta no existe , use el comando /start para crear una." };
    }

    const party = await Party.findOne({
        where: {
            party_id: hero.party
        }
    });

    if (party) return { msg: "🧾 Se encuentra actualmente registrado en un equipo de party. Para crear uno debe salir del equipo actual y esperar un plazo de 24 horas antes de unirse a otro.\n\nPara dejar el equipo de party actual use el comando /leaveparty", opts };

    setName[user_id] = true;

    return { msg: "🖋️ Inserte el id del equipo de party al que desea unirse:", opts };

};


bot.on("message", async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;
    
    if(!setName[user_id]) return;
    delete setName[user_id];
    if(data.text == "/cancel") return;
    joinPt(data);
});

const joinPt = async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;
    
    const char = /^[a-zA-Z0-9]+$/;
    if(!char.test(data.text)) return bot.sendMessage(chat_id , "El id solo puede contener caracteres alfanuméricos.");
    
    const hero = await Hero.findOne({
        where: {
            user_id: user_id
        }
    });

    if (!hero) {
        return bot.sendMessage(chat_id , "Esta cuenta no existe , use el comando /start para crear una.");
    }

    const party = await Party.findOne({
        where: {
            party_id: hero.party
        }
    });

    if (party) return bot.sendMessage(chat_id , "🧾 Se encuentra actualmente en un equipo. Para crear uno debe salir del equipo actual , puede dejar su equipo con el comando /ptleave");
    
    
    const cparty = await Party.findOne({
        where: {
            party_id : data.text
        }
    });
    
    if(!cparty) return bot.sendMessage(chat_id, "No se encontro el equipo insertado.");
    
    const members = JSON.parse(cparty.members);
    
    if(members.length > 15) return bot.sendMessage(mess_id , "El equipo ya se encuentra completo.");
    
    if(hero.status != "rest" || cparty.status != "rest") return bot.sendMessage(mess_id , "Para unirse al grupo se debe encontrar descansando.");
    if(hero.zone != cparty.zone) return bot.sendMessage(mess_id , "Debe encontrarse en la misma zona que el grupo para poder unirse.");
    
    members.push(user_id);
    
    await hero.setData({
        party: cparty.party_id
    });
    
    await cparty.setData({
        members : members
    });
    
    return bot.sendMessage(chat_id , "Te uniste correctamente al equipo '" + cparty.name + "' .");
    
};

bot.onText(/(^\/party_join.*|🔍 Unirse a Grupo)/, async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;

    let msg , opts;
    if(!data.text.split(" ")[1]) {
       const {msg , opts} = await partyJoin(user_id);
       bot.sendMessage(chat_id, msg, opts);
    }else {
        joinPt(data);
    }
});



module.exports = partyJoin;
