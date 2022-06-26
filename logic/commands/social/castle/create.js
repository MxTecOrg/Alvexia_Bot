const config = require("../../../../config.js");
const fs = require("fs");
const bot = require(config.DIRNAME + "/main.js");
const { User, Hero, Op, guild } = require(config.LOGIC + "/helpers/DB.js");
const uid = require(config.LOGIC + "/helpers/uid.js");

var setName = {};


const guildCreate = async (user_id) => {
    let opts = {
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: [
                [{ text: "🧾 Crear", callback_data: "guild_accept_create" }]
            ]
        }
    };

    const hero = await Hero.findOne({
        where: {
            user_id: user_id
        }
    });

    if (!hero) return { msg: "Esta cuenta no existe , use el comando /start para crear una." };


    const guild = await guild.findOne({
        where: {
            guild_id: hero.guild
        }
    });

    if (guild) {
        opts.reply_markup.inline_keyboard[0][0] = {
            text: "Atrás ↩️",
            callback_data: "guild_create"
        };

        return { msg: "🧾 Se encuentra actualmente en un gremio. Para crear uno debe salir del gremio actual , puede dejar su gremio con el comando /lguild" }

    }

    let msg = "📝 *Crear Gremio :*\n";

    return { msg, opts };
};

bot.on("callback_query", async (data) => {
    const user_id = data.from.id;
    const chat_id = data.message.chat.id;
    const mess_id = data.message.message_id;


    if (data.data == "guild_create") {
        const {msg , opts} = await guildCreate(user_id);
        opts.chat_id = chat_id;
        opts.message_id = mess_id;
        bot.editMessageText(msg , opts);
    } else if (data.data == "guild_accept_create") {
        const {msg , opts} = await guildAcceptCreate(user_id);
        opts.chat_id = chat_id;
        opts.message_id = mess_id;
        bot.editMessageText(msg, opts);
    }
});

const guildAcceptCreate = async (user_id) => {
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

    const guild = await guild.findOne({
        where: {
            guild_id: hero.guild
        }
    });

    if (guild) return { msg: "🧾 Se encuentra actualmente en un gremio. Para crear uno debe salir del gremio actual , puede dejar su gremio con el comando /lguild", opts }

    setName[user_id] = true;

    return { msg: "🖋️ Inserte el nombre de su gremio :", opts };

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
    
    const guild = await guild.findOne({
        where: {
            guild_id: hero.guild
        }
    });

    if (guild) return bot.sendMessage(chat_id , "🧾 Se encuentra actualmente en un gremio. Para crear uno debe salir del gremio actual , puede dejar su gremio con el comando /lguild");
    
    
    
    const pid = uid.alphanum(6);
    const cguild = await guild.create({
        guild_id: pid,
        name: data.text,
        owner: user_id,
        members: JSON.stringify({[user_id] : {
            daily_act : 0,
            week_act : 0
        }})
    });
    
    if(!cguild) return bot.sendMessage(chat_id, "Hay otro gremio con este nombre.");
    
    await hero.setData({
        guild: pid
    });
    
    return bot.sendMessage(chat_id , "El gremio `" + data.text + "` se creo correctamente.");
    
});

bot.onText(/(\/cguild|Crear Gremio 📝)/, async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;

    const { msg, opts } = await guildCreate(user_id);
    bot.sendMessage(chat_id, msg, opts);
});



module.exports = guildCreate;
