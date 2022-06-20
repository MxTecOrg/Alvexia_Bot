const config = require("../../../../config.js");
const fs = require("fs");
const bot = require(config.DIRNAME + "/main.js");
const { User, Hero, Op, Arena } = require(config.LOGIC + "/helpers/DB.js");
const uid = require(config.LOGIC + "/helpers/uid.js");

var setName = {};


const arenaLeave = async (user_id) => {
    let opts = {
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: [
                [{ text: "✅ Dejar", callback_data: "arena_leave" }]
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

    if (!arena) {
        return { msg: "🧾 No se encuentra en ningún equipo de arena" }

    }

    let msg = "🚷 *Dejar Equipo de Arena:*\n";

    return { msg, opts };
};

bot.on("callback_query", async (data) => {
    const user_id = data.from.id;
    const chat_id = data.message.chat.id;
    const mess_id = data.message.message_id;


    if (data.data == "arena_leave") {
        const {msg , opts} = await leaveArenaTeam(user_id);
        opts.chat_id = chat_id;
        opts.message_id = mess_id;
        bot.editMessageText(msg , opts);
    }
});

const leaveArenaTeam = async (user_id) => {
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

    if (!arena) {
        return { msg: "🧾 No se encuentra en ningún equipo de arena" }

    }
    
    hero.arena_time = new Date().getTime();
    const members = JSON.parse(arena.members);
    if(members.length <= 1) {
        await arena.destroy();
        await hero.setData({
            arena: "na",
            arena_time: hero.arena_time
        });
        return { msg: "❗Ah dejado correctamente el equipo de arena.", opts };
    }
    
    else if(arena.owner == user_id) {
        for(let m of members){
            if(m != user_id) {
                arena.owner = m;
                break;
            }
        }
        
    }
    
    members.splice(members.indexOf(user_id) , 1);
    
    await arena.setData({
        members: members,
        owner: arena.owner
    });
    
    await hero.setData({
        arena: "na",
        arena_time: hero.arena_time
    });
    
    return { msg: "❗Ah dejado correctamente el equipo de arena.", opts };

};

bot.onText(/(\/leavearena)/, async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;

    const { msg, opts } = await arenaLeave(user_id);
    bot.sendMessage(chat_id, msg, opts);
});



module.exports = arenaLeave;
