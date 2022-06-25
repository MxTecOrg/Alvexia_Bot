const config = require("../../../config.js");
const fs = require("fs");
const bot = require(config.DIRNAME + "/main.js");
const { User, Hero, Op } = require(config.LOGIC + "/helpers/DB.js");
const QUESTS = require(config.LOGIC + "/engine/quests.js");
const {addXp} = require(config.LOGIC + "/engine/attr_calc.js");

var aQuest = {};

const _quests = async (user_id, chat_id) => {
    const hero = await Hero.findOne({
        where: {
            user_id: user_id
        }
    });


    if (!hero) return { msg: "Esta cuenta no existe , use el comando /start para crear una." };


    if (!aQuest[user_id]) aQuest[user_id] = 0;
    let quests = JSON.parse(hero.quests);
    if (aQuest[user_id] >= quests.length || aQuest[user_id] <= 0) aQuest[user_id] = 0;
    if (!quests[aQuest[user_id]]) return { msg: "No posees misiones activas actualmente." };
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
                [{ text: (q.current >= q.total ? "✅ Completar" : "❕Incompleto"), callback_data: "quest_complete" }],
                [{ text: "⬅️ Anterior", callback_data: "quest_prev" }, { text: "Siguiente ➡️", callback_data: "quest_next" }]
            ]
        }
    }

    return { msg, opts }


};

bot.onText(/(\/quests|Quests 🗺️)/, async (data) => {
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

    
    if(data.data.includes("quest_")) switch (data.data) {
        case "quest_complete":
            bot.deleteMessage(chat_id, mess_id);
            completeQuest(user_id, chat_id);
            break;
        case "quest_prev":
            let pq = aQuest[user_id];
            if(!pq) aQuest[user_id] = 0;
            if(aQuest[user_id] == 0) aQuest[user_id] = (JSON.parse(hero.quests).length - 1);
            else aQuest[user_id] -= 1;
            let ac = aQuest[user_id];
            const { msg, opts } = await _quests(user_id);
            opts.chat_id = chat_id;
            opts.message_id = mess_id;
            if (pq != ac) bot.editMessageText(msg, opts);
            break;
        case "quest_next":
            let _pq = aQuest[user_id];
            if (!_pq) aQuest[user_id] = 0;
            if (aQuest[user_id] == (JSON.parse(hero.quests).length - 1)) aQuest[user_id] = 0;
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

    for (let q of quests) {
        if (q.id == quest) {
            bot.sendMessage(chat_id, "La misión '" + Q.name + "' ya se encuentra activa.");
            return;
        }
    }

    quests.push({
        id: Q.id,
        current: Q.goal.current,
        total: Q.goal.total
    });

    await hero.setData({
        quests: quests
    });

    bot.sendMessage(chat_id, "Se acepto la misión '" + Q.name + "'");
};

const completeQuest = async (user_id, chat_id) => {

    const hero = await Hero.findOne({
        where: {
            user_id: user_id
        }
    });
    let quests = JSON.parse(hero.quests);
    let inventory = JSON.parse(hero.inventory);
    let coins = JSON.parse(hero.coins);
    if (!quests[aQuest[user_id]]) return;
    let Q = QUESTS.getQuests()[quests[aQuest[user_id]].id];
    if (!Q) return;
    let quest = quests[aQuest[user_id]].id;
    for (let q in quests) {
        if (quests[q].id == quest) {
            if (quests[q].current >= quests[q].total) {
                if (Q.rewards.item != "" && inventory.items.length >= (inventory.bags * 10)) return bot.sendMessage(chat_id, "No tiene espació en su bolsa para recibir los objetos de misión.");
                if(Q.rewards.items != "") inventory.items.push(Q.rewards.item);



                if (Q.rewards.consumable != "" && inventory.consumables.length >= (inventory.bags * 10)) return bot.sendMessage(chat_id, "No tiene espació en su bolsa para recibir los objetos de misión.");
                if(Q.rewards.items != "") inventory.consumables.push(Q.rewards.consumable);


                for (let material in inventory.materials) {
                    if (Q.rewards.material == inventory.materials[material].id) {
                        inventory.materials[material].amount += 1;
                        break;
                    }
                    if (material == (inventory.materials.length - 1)) {
                        inventory.materials.push(Q.rewards.material);
                    }
                }


                coins.gold += Q.rewards.gold;
                await addXp(user_id , chat_id ,Q.rewards.xp);


                bot.sendMessage(chat_id, "Se completo la misión y se obtuvo 💰 " + Q.rewards.gold + ", 🧠 " + Q.rewards.xp);
                quests.splice(q, 1);
                await hero.setData({
                    quests: quests,
                    inventory: inventory,
                    coins: coins
                });
                if(Q.next) await acceptQuest(user_id , chat_id , Q.next);
                return;
            }
            return;
        }
    }
}
