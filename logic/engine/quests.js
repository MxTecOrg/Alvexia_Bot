const config = require("../../../config.js");
const bot = require(config.DIRNAME + "/main.js");
const { Hero } = require(config.LOGIC + "/helpers/DB.js");
const fs = require("fs");

var QUESTS = {};

const checkKillQuests = async (user_id, enemiesKilled) => {
    const hero = await Hero.findOne({
        where: {
            user_id: user_id
        }
    });
    let quests = JSON.parse(hero.quests);
    for (let q in quests) {
        if (quests[q].type != "kill") continue;
        if (quests[q].goal.current >= quests[q].goal.total) continue;
        for (let enemy of enemiesKilled) {
            if (quests[q].goal.enemy == enemy) quests[q].goal.current++;
        }
    }

    await hero.setData({
        quests: quests
    });
};

const load = () => {
    const quests = fs.readDirSync(config.DB + "/quests/");

    for (let quest of quests) {
        const name = quest.replace(".json", "");
        QUESTS[name] = fs.readFileSync(config.DB + '/quests/' + quest);
    }

    console.log("Quests loaded...");
};

var aQuest = {};

const activeQuests = async (user_id, chat_id) => {
    const hero = await Hero.findOne({
        where: {
            user_id: user_id
        }
    });
    if (!aQuest[user_id]) aQuest[user_id] = 0;
    let quests = JSON.parse(hero.quests);
    if (aQuest[user_id] >= quests.length || aQuest[user_id] <= 0) aQuest[user_id] = 0;
    if (!quests[aQuest[user_id]]) return bot.sendMessage(chat_id , "No posees misiones activas actualmente."); //retornar que no posees misiones
    const q = quests[aQuest[user_id]];
    const qq = QUESTS[q.id];
    const rew = qq.rewards;
    const obj, cons, mat;

    const r = "🎁 *Recompesas:*\n" +
        "💰 Oro: *" + rew.gold + "* \n" +
        "🧠 XP: *" + rew.xp + "* \n" +
        (rew.item != "" ? "🧤 Objeto: *" + rew.item + "* \n" : "") +
        (rew.consumable != "" ? "🧤 🧪 Consumible: *" + rew.consumable + "* \n" : "") +
        (rew.material != "" ? "⚒️ Material: *" + rew.material + "* \n" : "");
        
    const goal = qq.goal;
    let g = "action";
    if(qq.type == "kill") g = "⚔️ Matar";
    if(qq.type == "gather") g = "🧺 Recolectar";
    
    const req = (g != "action" ? 
        g + ": " + goal.require + " - *" + q.current + "/" + q.total + "*\n"
    :"");


    const str = "📃 *Misiones*: \n\n" +
        "🖋️ Nombre: *" + qq.name + "*\n" +
        "🧾 Descripción: *" + qq.desc + "* \n" +
        "" + req + r;
    
    const opts = {
        parse_mode : "Markdown",
        reply_markup: {
            inline_keyboard : [
                [{text : (q.current == q.total ? "✅ Completar" : "❕Incompleto") , callback_data: "quest complete"}],
                [{text : "⬅️ Anterior" , callback_data : "quest prev"} , {text: "Siguiente ➡️" , callback_data : "quest next"}]
            ]
        }
    }
    
    bot.sendMessage(chat_id , str , opts);


};

const acceptQuest = async (user_id, chat_id, quest) => {
    if (QUESTS[quest]) return;
    const hero = await Hero.findOne({
        where: {
            user_id: user_id
        }
    });
    let quests = JSON.parse(hero.quests);

    for (let q of quests) {
        if (q.id == quest) {
            bot.sendMessage(chat_id, "La misión '" + q.name + "' ya se encuentra activa.");
            return;
        }
    }

    quests.push(QUESTS[quest]);

    await hero.setData({
        quests: quests
    });

    bot.sendMessage(chat_id, "Se acepto la misión '" + QUESTS[quest].name + "'");
};

const completeQuest = async (user_id, chat_id, quest) => {
    if (QUESTS[quest]) return;
    const hero = await Hero.findOne({
        where: {
            user_id: user_id
        }
    });
    let quests = JSON.parse(hero.quests);
    let inventory = JSON.parse(hero.inventory);
    let coins = JSON.parse(hero.coins);

    for (let q in quests) {
        if (quests[q].id == quest) {
            if (quests[q].goal.current >= quests[q].goal.total) {
                if (quests[q].rewards.item != "" && inventory.armory.length >= (inventory.bags * 10)) return bot.sendMessage(chat_id, "No tiene espació en su bolsa para recibir los objetos de misión.");
                inventory.armory.push(quests[q].rewards.item);



                if (quests[q].rewards.consumable != "" && inventory.consumables.length >= (inventory.bags * 10)) return bot.sendMessage(chat_id, "No tiene espació en su bolsa para recibir los objetos de misión.");
                inventory.consumables.push(quests[q].rewards.consumable);


                for (let material in inventory.materials) {
                    if (quest[q].rewards.material == inventory.materials[material].id) {
                        inventory.materials[material].amount += 1;
                        break;
                    }
                    if (material == (inventory.materials.length - 1)) {
                        inventory.materials.push(mat);
                    }
                }


                //Añadir oro y xp


                bot.sendMessage(chat_id, "Se completo la misión y se obtuvo 💰 " + quests[q].rewards.gold + ", 🧠 " + quests[q].rewards.xp + (sItem ? " y los objetos " + sItem : ""));
                quests.splice(q, 1);
                await hero.setData({
                    quests: quests,
                    inventory: inventory,
                    coins: coins,
                    xp: xp
                });
                return;
            }
            bot.sendMessage(chat_id, "No se cumplen los requisitos para completar la misión.");
            return;
        }
    }
}

module.exports = {
    load,
    checkKillQuests,
    completeQuest,
    acceptQuest,
    activeQuests
}