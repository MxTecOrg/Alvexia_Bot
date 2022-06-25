const config = require("../../../config.js");
const fs = require("fs");
const bot = require(config.DIRNAME + "/main.js");
const { User, Hero, Op , Item} = require(config.LOGIC + "/helpers/DB.js");

const {getEnergyTime} = require(config.LOGIC + "/engine/attr_calc.js");
const level_db = JSON.parse(fs.readFileSync(config.DB + "/level_db.json"));

const hstatus = async (user_id, chat_id) => {
    const opts = {
        reply_markup: {
            resize_keyboard: true,
            inline_keyboard: [
                [
                    {text : "📊 Estadísticas" , callback_data : "stadistics"}
                ]
            ]
        },
        parse_mode : "Markdown"
    };

    const hero = await Hero.findOne({
        where: {
            user_id: user_id
        }
    });

    if (!hero) return bot.sendMessage(chat_id, "Esta cuenta no existe , use el comando /start para crear una.");
    
    const attr = JSON.parse(hero.total_attr);
    const attr_str = {
        "sta" : "♥️ Vitalidad",
        "con" : "🔷 Concentración",
        "str" : "💪🏻 Fuerza",
        "agl" : "🦶🏻 Agilidad",
        "int" : "🧠 Intelecto",
        "luck": "🍀 Suerte"
    };

    let msg = "✨ *Atributos:* \n";
    for(let a in attr){
        msg += "\n" + attr_str[a] + ": *" + attr[a] + "* ";
    }
    return { msg, opts};
};

const stadistics = async (user_id, chat_id) => {
    const opts = {
        reply_markup: {
            resize_keyboard: true,
            inline_keyboard: [
                [
                    { text: "✨ Atributos", callback_data: "hattr" }
                ]
            ]
        },
        parse_mode: "Markdown"
    };

    const hero = await Hero.findOne({
        where: {
            user_id: user_id
        }
    });

    if (!hero) return bot.sendMessage(chat_id, "Esta cuenta no existe , use el comando /start para crear una.");

    const stats = JSON.parse(hero.stats);
    const stats_str = {
        hp: "♥️ Vida",
        hp_reg: "🔴 Reg. Vida",
        mp: "🔷 Mana",
        mp_reg: "🔵 Reg. Mana",
        atk: "🗡️ Ataque",
        def: "🛡️ Defensa",
        crit: "🎯 Crítico",
        dodge: "🌀 Evasión",
        speed: "💫 Velocidad",
        xp_extra: "💡 XP Extra",
        gold_extra: "💰 Oro Extra"
    };
    let count = 0;
    let msg = "📊 *Estadísticas*: \n";
    for (let s in stats) {
        msg += "\n" + stats_str[s] + ": *" + (count > 3 ? (stats[s]).toFixed(2) : stats[s]) + (s > 4 ? "%*" : "*");
        count++;
    }
    return { msg, opts };
};

bot.onText(/(\/hstats|👤 Estadísticas)/, async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;

    const {msg , opts } = await hstatus(user_id, chat_id);
    bot.sendMessage(chat_id , msg , opts);
});




bot.on("callback_query", async (data) => {
    const user_id = data.from.id;
    const chat_id = data.message.chat.id;
    const mess_id = data.message.message_id;
    

    if(data.data == "stadistics") {
        const {msg , opts} = await stadistics(user_id , chat_id);
        opts.chat_id = chat_id;
        opts.message_id = mess_id;
        if(mess_id) bot.editMessageText(msg , opts);
    }
    
    if (data.data == "hattr") {
        const { msg, opts } = await hstatus(user_id, chat_id);
        opts.chat_id = chat_id;
        opts.message_id = mess_id;
        if (mess_id) bot.editMessageText(msg, opts);
    }
});
