const config = require("../../../config.js");
const fs = require("fs");
const bot = require(config.DIRNAME + "/main.js");
const { User, Hero, Op, Consumable } = require(config.LOGIC + "/helpers/DB.js");
const { updateStats } = require(config.LOGIC + "/engine/attr_calc.js");

var seg = {};

const consumables = async (user_id, _page) => {
    let opts = {
        reply_markup: {
            inline_keyboard: [
            ]
        },
        parse_mode: "Markdown"
    };

    const hero = await Hero.findOne({
        where: {
            user_id: user_id
        }
    });
    let page = parseInt(_page);
    if (!hero) return { msg: "Esta cuenta no existe , use el comando /start para crear una." };

    const inv = JSON.parse(hero.inventory);

    if (!page || page < 0 || page >= inv.consumables.length) page = 0;
    let msg = "🛡️ *Objetos:* \n\n" +
        "🎒 Espacio: *" + inv.consumables.length + "/" + (inv.bags * 10) + "*\n" +
        "📜 Mostrando: *" + page + "-" + (page + 10) + "*";

    for (let i = page; i < (page + 10); i++) {
        let irow = [];
        if (!inv.consumables[i]) continue;
        const con = await Consumable.findOne({
            where: {
                item_id: inv.consumables[i]
            }
        });
        if (!con) continue;
        
        
        irow.push({
            text: item.name,
            callback_data: "consumable_look " + inv.consumables[i]
        }, {
            text: "👋🏻",
            callback_data: "use_consumable " + con.type + " " + i
        }, {
            text: "🗑️",
            callback_data: "delete_consumable " + i + " " + con.name
        });

        opts.reply_markup.inline_keyboard.push(irow);
    }

    opts.reply_markup.inline_keyboard.push([{
        text: "⬅️ Anterior",
        callback_data: "consumables " + (parseInt(page) - 10)
    }, {
        text: "Siguiente ➡️",
        callback_data: "consumables " + (parseInt(page) + 10)
    }]);

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

const useConsumable = async (user_id , mod) => {
    const hero = await Hero.findOne({
        where: {
            user_id: user_id
        }
    });
    
    if (!hero) return { msg: "Esta cuenta no existe , use el comando /start para crear una." };
    
    const inv = JSON.parse(hero.inventory);
    
    if(!inv.consumables[mod]) return false;
    
    const con = await Consumable.findOne({
        where: {
            item_id: inv.consumables[mod]
        }
    });
    
    if(!con) return false;
    
    switch(con.type){
        case "potion":
            break;
        case "scroll":
            break;
        case "spell":
            break;
    }
};

const consumableLook = async (item_id) => {
    const con = await Consumable.findOne({
        where: {
            item_id: item_id
        }
    });

    const opts = {
        reply_markup: {
            resize_keyboard: true,
            inline_keyboard: [
            [{ text: "Atrás ↩️", callback_data: "consumables 0" }]
                    ]
        },
        parse_mode: "Markdown"
    };

    if (!con) return { msg: "No se encontro el objeto.", opts };

    const attr_str = {
        level: "🆙 Nivel",
        class: "⚜️ Clase",
        expertice: "🔰 Maestria",
        modLvl: "🔨 Mod",
        sta: "♥️ Vitalidad",
        con: "🔷 Concentración",
        str: "💪🏻 Fuerza",
        agl: "🦶🏻 Agilidad",
        int: "🧠 Intelecto",
        luck: "🍀 Suerte",
        pa: "💡 PA",
        pe: "⚡ PE",
        max_pe: "🔋 PE Máximo",
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
        gold_extra: "💰 Oro Extra",
        cost: "💲 Costo"
    };

    let msg = "🧪 *Consumible:*\n\n" +
        "🆔 ID: `" + con.item_id + "`\n" +
        "🧾 Nombre: *" + con.name + "* \n" +
        "📔 Tipo: *" + con.type + "* \n" +
        "📖 Descripción: _" + con.desc + "_ \n" +
        (con.isMod ? attr_str.modLvl + ": *" + con.modLvl + "*\n" : "");
        if(con.target != "") msg += "🎯 Objetivos: *" + con.target + "*\n"
        if(con.formula != "") msg += "⚗️ Formula: *" + con.formula + "*\n"


    const conD = con.getData();
    let count = 0;
    for (let i in conD) {
        if (conD[i] == 0) continue;
        msg += "\n" + attr_str[i] + ": *" + (count > 0 ? Number(conD[i]).toFixed(2) + "%" : conD[i]) + "*";
        count++;
    }

    msg += "\n" + attr_str.cost + "*" + con.cost + "*";

    return {
        msg,
        opts
    }
};

const delConsumable = async (user_id, mod, name) => {
    let opts = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "✅ Aceptar",
                        callback_data: "del_consumable_accept " + mod + " " + name
                    },
                    {
                        text: "❌ Cancelar",
                        callback_data: "consumables 0"
                    }
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

    if (!hero) return { msg: "Esta cuenta no existe , use el comando /start para crear una." };

    const msg = "⁉️ Estás seguro que deseás eliminar el objeto *" + name + "* ❓";
    return { msg, opts };

};

const delConsumableAccept = async (user_id, mod, name) => {
    const hero = await Hero.findOne({
        where: {
            user_id: user_id
        }
    });

    if (!hero) return { msg: "Esta cuenta no existe , use el comando /start para crear una." };

    const inv = JSON.parse(hero.inventory);
    if (!inv.consumables[mod]) return {msg : false};

    const con = await Consumable.findOne({
        where: {
            item_id: inv.consumables[mod]
        }
    });

    if (con.name != name) return {msg : false};

    inv.consumables.splice(mod, 1);
    
    await hero.setData({
        inventory: inv
    });

    const { msg, opts } = await consumables(chat_id, 0);

    return {
        msg,
        opts
    };
};



bot.on("callback_query", async (data) => {
    const user_id = data.from.id;
    const chat_id = data.message.chat.id;
    const mess_id = data.message.message_id;

    if (data.data.includes("consumables ")) {
        const mod = data.data.split(" ")[1];
        delete seg[user_id];
        const { msg, opts } = await consumables(user_id, mod);
        if (msg == false) return;
        opts.chat_id = chat_id;
        opts.message_id = mess_id;
        bot.editMessageText(msg, opts);
    }
    else if (data.data.includes("consumable_look ")) {
        const mod = data.data.split(" ")[1];
        const { msg, opts } = await consumableLook(mod);
        opts.chat_id = chat_id;
        opts.message_id = mess_id;
        bot.editMessageText(msg, opts);
    }
    
    else if (data.data.includes("delete_consumable ")) {
        const mod = parseInt(data.data.split(" ")[1]);
        const name = data.data.split(" ")[2];
        const { msg, opts } = await delConsumable(user_id, mod , name);
        if(msg == false) return;
        opts.chat_id = chat_id;
        opts.message_id = mess_id;
        bot.editMessageText(msg, opts);
    }
    else if (data.data.includes("del_consumable_accept ")) {
        const mod = parseInt(data.data.split(" ")[1]);
        const name = data.data.split(" ")[2];
        const { msg, opts } = await delConsumableAccept(user_id, mod, name);
        if (msg == false) return;
        opts.chat_id = chat_id;
        opts.message_id = mess_id;
        bot.editMessageText(msg, opts);
    }
    else if (data.data.includes("use_consumable ")) {
        const mod = parseInt(data.data.split(" ")[1]);
        const { msg, opts } = await useConsumable(user_id, mod);
        if (msg == false) return;
        opts.chat_id = chat_id;
        opts.message_id = mess_id;
        bot.editMessageText(msg, opts);
    }
});


bot.onText(/(\/consumables|Consumibles 🧪)/, async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;
    if(seg[user_id]) delete seg[user_id];
    const { msg, opts } = await consumables(user_id);
    bot.sendMessage(chat_id, msg, opts);
});



module.exports = consumables;
