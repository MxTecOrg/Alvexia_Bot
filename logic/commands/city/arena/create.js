const config = require("../../../../config.js");
const fs = require("fs");
const bot = require(config.DIRNAME + "/main.js");
const { User, Hero, Op, Arena } = require(config.LOGIC + "/helpers/DB.js");
const uid = require(config.LOGIC + "/helpers/uid.js");

var setName = {};


const arenaCreate = async (user_id) => {
    let opts = {
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: [
                [{ text: "🧾 Crear", callback_data: "arena_team_create" }]
            ]
        }
    };

    const hero = await Hero.findOne({
        where: {
            user_id: user_id
        }
    });

    if (!hero) return { msg: "Esta cuenta no existe , use el comando /start para crear una." };


    const arena = await Arena.findOne({
        where: {
            arena_id: hero.arena
        }
    });

    if (arena) {
        opts.reply_markup.inline_keyboard[0][0] = {
            text: "Atrás ↩️",
            callback_data: "arena_create"
        };

        return { msg: "🧾 Se encuentra actualmente registrado en un equipo de arena. Para crear uno debe salir del equipo actual y esperar un plazo de 24 horas antes de unirse a otro.\n\nPara dejar el equipo de arena actual use el comando /leavearena" }

    }

    let msg = "🧾 *Crear Equipo de Arena:*\n";

    msg += "\n💲 Costo de creación: *" + config.ARENA.createCost + "💰*";

    return { msg, opts };
};

bot.on("callback_query", async (data) => {
    const user_id = data.from.id;
    const chat_id = data.message.chat.id;
    const mess_id = data.message.message_id;


    if (data.data == "arena_create") {
        const {msg , opts} = await arenaCreate(user_id);
        opts.chat_id = chat_id;
        opts.message_id = mess_id;
        bot.editMessageText(msg , opts);
    } else if (data.data == "arena_team_create") {
        const {msg , opts} = await createArenaTeam(user_id);
        opts.chat_id = chat_id;
        opts.message_id = mess_id;
        bot.editMessageText(msg, opts);
    }
});

const createArenaTeam = async (user_id) => {
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

    const arena = await Arena.findOne({
        where: {
            arena_id: hero.arena
        }
    });

    if (arena) return { msg: "🧾 Se encuentra actualmente registrado en un equipo de arena. Para crear uno debe salir del equipo actual y esperar un plazo de 24 horas antes de unirse a otro.\n\nPara dejar el equipo de arena actual use el comando /leavearena", opts };

    setName[user_id] = true;

    return { msg: "🖋️ Inserte el nombre de su equipo de arena:", opts };

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

    const arena = await Arena.findOne({
        where: {
            arena_id: hero.arena
        }
    });

    if (arena) return bot.sendMessage(chat_id , "🧾 Se encuentra actualmente registrado en un equipo de arena. Para crear uno debe salir del equipo actual y esperar un plazo de 24 horas antes de unirse a otro.\n\nPara dejar el equipo de arena actual use el comando /leavearena");
    
    const coins = JSON.parse(hero.coins);
    
    if(coins.gold < config.ARENA.createCost) return bot.sendMessage(chat_id , "No tiene suficiente oro para crear el equipo de arena");
    coins.gold -= config.ARENA.createCost;
    
    const time = (new Date().getTime() - (hero.arena_time + (24 * 60 * 60 * 1000)));
    
    if(time < 0) return bot.sendMessage(chat_id , "Debe esperar " + (+time) + " Horas antes de volver a unirse a otro equipo de arena." )
    
    const carena = await Arena.create({
        arena_id: uid.alphanum(6),
        name: data.text,
        owner: user_id,
        members: JSON.stringify([user_id])
    });
    
    if(carena) return bot.sendMessage(chat_id, "Hay otro equipo de arena con este nombre.");
    
    await hero.setData({
        coins: coins,
        arena: carena.arena_id
    });
    
    return bot.sendMessage(chat_id , "El equipo de arena '" + data.text + "' se creo correctamente.");
    
});

bot.onText(/(\/arena_create|Crear Equipo 🧾)/, async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;

    const { msg, opts } = await arenaCreate(user_id);
    bot.sendMessage(chat_id, msg, opts);
});



module.exports = arenaCreate;
