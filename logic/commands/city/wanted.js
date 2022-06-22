const config = require("../../../config.js");
const fs = require("fs");
const bot = require(config.DIRNAME + "/main.js");
const { User, Hero, Op } = require(config.LOGIC + "/helpers/DB.js");
const {getCity} = require(config.LOGIC + "/engine/map.js");
const QUESTS = require(config.LOGIC + "/engine/quests.js");

var aQuest = {};

const _quests = async (user_id, chat_id) => {
    const hero = await Hero.findOne({
        where: {
            user_id: user_id
        }
    });


    if (!hero) return { msg: "Esta cuenta no existe , use el comando /start para crear una." };
    
    const city = getCity(hero.city)
    if(!city) return {msg: "No hay misiónes en esta ciudad"};
    
    if (!aQuest[user_id]) aQuest[user_id] = 0;
    let quests = city.quests;
    if (aQuest[user_id] >= quests.length || aQuest[user_id] <= 0) aQuest[user_id] = 0;
    if (!quests[aQuest[user_id]]) return { msg: "No posees misiones disponibles actualmente." };
    const q = quests[aQuest[user_id]];
    const qq = QUESTS.getQuests()[q.id];
    const rew = qq.rewards;
    let obj, cons, mat;

    const r = "🎁 *Recompesas:*\n" +
        "💰 Oro: *" + rew.gold + "* \n" +
        "🧠 XP: *" + rew.xp + "* \n" +
        (rew.item != "" ? "🧤 Objeto: *" + rew.item + "* \n" : "") +
        (rew.consumable != "" ? "🧤 🧪 Consumible: *" + rew.consumable + "* \n" : "") +
        (rew.material != "" ? "⚒️ Material: *" + rew.material + "* \n" : "");

    const goal = qq.goal;
    let g = "action";
    if (qq.type == "kill") g = "⚔️ Matar";
    if (qq.type == "gather") g = "🧺 Recolectar";

    const req = (g != "action" ?
        g + ": " + goal.require + " - *" + q.current + "/" + q.total + "*\n" :
        "");


    const msg = "📃 *Misiones*: \n\n" +
        "🗺️ Mision: *" + (aQuest[user_id] + 1) + "/" + quests.length + "* \n" +
        "🖋️ Nombre: *" + qq.name + "*\n" +
        "🧾 Descripción: *" + qq.desc + "* \n\n" +
        "" + req + "\n" + r;

    const opts = {
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: [
                [{ text:"📝 Aceptar" , callback_data: "wanted_accept" }],
                [{ text: "⬅️ Anterior", callback_data: "wanted_prev" }, { text: "Siguiente ➡️", callback_data: "wanted_next" }]
            ]
        }
    }

    return { msg, opts }


};

bot.onText(/(\/wanted|📜 Se busca)/, async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;

    const { msg, opts } = await _quests(user_id);
    bot.sendMessage(chat_id, msg, opts);
});

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
        bot.deleteMessage(chat_id , mess_id);
        return bot.sendMessage(chat_id , "Esta cuenta no existe , use el comando /start para crear una.");
    }
    
    const city = getCity(hero.zone);
    if(!city) return;
    
    if(data.data.includes("wanted_")) switch (data.data) {
        case "wanted_accept":
            bot.deleteMessage(chat_id, mess_id);
            completeQuest(user_id, chat_id);
            break;
        case "wanted_prev":
            let pq = aQuest[user_id];
            if(!pq) aQuest[user_id] = 0;
            if(aQuest[user_id] == 0) aQuest[user_id] = (city.quests.length - 1);
            else aQuest[user_id] -= 1;
            let ac = aQuest[user_id];
            const { msg, opts } = await _quests(user_id);
            opts.chat_id = chat_id;
            opts.message_id = mess_id;
            if (pq != ac) bot.editMessageText(msg, opts);
            break;
        case "wanted_next":
            let _pq = aQuest[user_id];
            if (!_pq) aQuest[user_id] = 0;
            if (aQuest[user_id] == (city.quests.length - 1)) aQuest[user_id] = 0;
            else aQuest[user_id] += 1;
            let _ac = aQuest[user_id];
            const { _msg, _opts } = await _quests(user_id);
            _opts.chat_id = chat_id;
            _opts.message_id = mess_id;
            if (_pq != _ac) bot.editMessageText(_msg, _opts);
            break;
        default:
            break;
    }
});


const acceptQuest = async (user_id, chat_id, quest) => {
    let Q = QUESTS.getQuests()[quest];
    if (!Q) return;
    const hero = await Hero.findOne({
        where: {
            user_id: user_id
        }
    });
    let quests = JSON.parse(hero.quests);
    let questsDaily = JSON.parse(hero.quests_daily);

    for (let q of quests) {
        if (q.id == quest) {
            bot.sendMessage(chat_id, "La misión '" + Q.name + "' ya se encuentra activa.");
            return;
        }
    }
    
    if(questsDaily.includes(quest)) return bot.sendMessage(chat_id , "Ya cumplió esta misión hoy. Vuelva mañana.");

    quests.push({
        id: Q.id,
        current: Q.goal.current,
        total: Q.goal.total
    });
    
    questsDaily.push(Q.id);

    await hero.setData({
        quests: quests,
        quests_daily: questsDaily
    });

    bot.sendMessage(chat_id, "Se acepto la misión '" + Q.name + "'");
};

