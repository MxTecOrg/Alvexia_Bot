const config = require("../../../../config.js");
const fs = require("fs");
const bot = require(config.DIRNAME + "/main.js");
const { User, Hero, Op, Party } = require(config.LOGIC + "/helpers/DB.js");
const uid = require(config.LOGIC + "/helpers/uid.js");

var setName = {};


const partyCreate = async (user_id) => {
    let opts = {
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: [
                [{ text: "🧾 Crear", callback_data: "party_accept_create" }]
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

    let msg = "📝 *Crear Grupo :*\n";

    return { msg, opts };
};

bot.on("callback_query", async (data) => {
    const user_id = data.from.id;
    const chat_id = data.message.chat.id;
    const mess_id = data.message.message_id;


    if (data.data == "party_create") {
        const {msg , opts} = await partyCreate(user_id);
        opts.chat_id = chat_id;
        opts.message_id = mess_id;
        bot.editMessageText(msg , opts);
    } else if (data.data == "party_accept_create") {
        const {msg , opts} = await partyAcceptCreate(user_id);
        opts.chat_id = chat_id;
        opts.message_id = mess_id;
        bot.editMessageText(msg, opts);
    }
});

const partyAcceptCreate = async (user_id) => {
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

    if (party) return { msg: "🧾 Se encuentra actualmente en un equipo. Para crear uno debe salir del equipo actual , puede dejar su equipo con el comando /ptleave", opts }

    setName[user_id] = true;

    return { msg: "🖋️ Inserte el nombre de su equipo :", opts };

};


bot.on("message", async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;
    
    if(!setName[user_id]) return;
    delete setName[user_id];
    if(data.text == "/cancel") return;
    const char = /^[a-zA-Z0-9]+$/;
    if(data.text.length > 25 || !char.test(data.text)) return bot.sendMessage(chat_id , "El nombre debe ser menor de 25 dígitos y solo puede contener caracteres alfanuméricos.");
    
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
    
    
    
    
    const cparty = await Party.create({
        party_id: uid.alphanum(6),
        name: data.text,
        owner: user_id,
        members: JSON.stringify([user_id]),
        zone: hero.zone
    });
    
    if(!cparty) return bot.sendMessage(chat_id, "Hay otro equipo con este nombre.");
    
    await hero.setData({
        party: cparty.party_id
    });
    
    return bot.sendMessage(chat_id , "El equipo `" + data.text + "` se creo correctamente.");
    
});

bot.onText(/(\/party_create|Crear Grupo 📝)/, async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;

    const { msg, opts } = await partyCreate(user_id);
    bot.sendMessage(chat_id, msg, opts);
});



module.exports = partyCreate;
