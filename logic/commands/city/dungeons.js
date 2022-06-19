const config = require("../../../config.js");
const fs = require("fs");
const bot = require(config.DIRNAME + "/main.js");
const { User, Hero, Op } = require(config.LOGIC + "/helpers/DB.js");
const { getCity, getDungeon } = require(config.LOGIC + "/engine/map.js");

var select = {} , seg = {};

const dungeons = async (user_id, ) => {
    let opts = {
        parse_mode: "Markdown",
    };

    const hero = await Hero.findOne({
        where: {
            user_id: user_id
        }
    });

    if (!hero) return { msg: "Esta cuenta no existe , use el comando /start para crear una." };

    const city = getCity(hero.zone);

    if (!select[user_id] || select[user_id] < 0 || select[user_id] >= city.dungeons.length) select[user_id] = 0;

    let msg = "🏚️ *Mazmorras:*\n";

    if (city.dungeons.length < 1) {
        msg += "\nNo hay mazmorras cercanas a esta locación.";
        return { msg, opts };
    }

    opts.reply_markup = {
        inline_keyboard: [
            [{
                text: "⬅️ Anterior",
                callback_data: "dungeon_prev"
                    }, {
                text: "⚔️ Desafiar " + select[user_id],
                callback_data: "dungeon_start"
                    }, {
                text: "Siguiente ➡️",
                callback_data: "dungeon_next"
                    }]
            ]
    }
    
    const dung = getDungeon(city.dungeons[select[user_id]]);
    
    msg += "🏚️* " + dung.name + "* \n\n" +
    "_" + dung.desc + "_\n\n" +
    "🆙 Nivel requerido: *" + dung.level.min + "-" + dung.level.max + "*\n" +
    "⏳ Tiempo de viaje: *" + dung.travel_time + "m* \n" +
    "🎁 Recompensas:\n" +
    "🧠 XP: *" + dung.reward.xp + "*\n" +
    "💰 Oro: *" + dung.reward.gold + "*";

    let _opts = JSON.parse(JSON.stringify(opts));
    if (!seg[user_id]) seg[user_id] = { msg: msg + ".", _opts };
    if (compare(seg[user_id], { msg, opts })) {
        return { msg: false };
    }
    seg[user_id] = { msg, opts: _opts };

    return { msg, opts };
};

const compare = (obj1, obj2) => {
    if (typeof(obj1) != typeof(obj2)) return false;
    if (typeof(obj1) == "object" && obj1.constructor.name != obj2.constructor.name) return false;
    if (obj1.constructor.name == "Object") {
        const obj1keys = Object.keys(obj1);
        const obj2keys = Object.keys(obj2);
        if (obj1keys.length != obj2keys.length) return false;
        for (let key in obj1) {
            if (!obj2keys.includes(key)) return false;
            if (!compare(obj1[key], obj2[key])) return false;
        }
        return true;
    } else if (obj1.constructor.name == "Array") {
        if (obj1.length != obj2.length) return false;
        for (let i in obj1) {
            if (!compare(obj1[i], obj2[i])) return false;
        }
        return true;
    }
    if (obj1 != obj2) return false;
    return true;
};

bot.on("callback_query", async (data) => {
    const user_id = data.from.id;
    const chat_id = data.message.chat.id;
    const mess_id = data.message.message_id;
    const hero = await Hero.findOne({
        where: {
            user_id: user_id
        }
    });


    if (!hero) {
        bot.deleteMessage(chat_id, mess_id);
        return bot.sendMessage(chat_id, "Esta cuenta no existe , use el comando /start para crear una.");
    }


    if (data.data.includes("dungeon_")) switch (data.data) {
        case "dungeon_start":
            bot.deleteMessage(chat_id, mess_id);
            //(user_id, chat_id);
            break;
        case "dungeon_prev":
            if(select[user_id]) select[user_id] -= 1;
            const { msg, opts } = await dungeons(user_id);
            if(msg == false) return;
            opts.chat_id = chat_id;
            opts.message_id = mess_id;
            bot.editMessageText(msg, opts);
            break;
        case "dungeon_next":
            if(select[user_id]) select[user_id] -= 1;
            const { _msg, _opts } = await dungeons(user_id);
            if(_msg == false) return;
            _opts.chat_id = chat_id;
            _opts.message_id = mess_id;
            bot.editMessageText(_msg, _opts);
            break;
        default:
            break;
    }
});

bot.onText(/(\/dungeons|🏚️ Mazmorras)/, async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;

    const { msg, opts } = await dungeons(user_id);
    bot.sendMessage(chat_id, msg, opts);
});



module.exports = dungeons;
