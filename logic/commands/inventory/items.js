const config = require("../../../config.js");
const fs = require("fs");
const bot = require(config.DIRNAME + "/main.js");
const { User, Hero, Op, Item } = require(config.LOGIC + "/helpers/DB.js");
const { updateStats } = require(config.LOGIC + "/engine/attr_calc.js");

var seg = {};

const items = async (user_id, _page) => {
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

    if (!page || page < 0 || page >= inv.items.length) page = 0;
    let msg = "🛡️ *Objetos:* \n\n" +
        "🎒 Espacio: *" + inv.items.length + "/" + (inv.bags * 10) + "*\n" +
        "📜 Mostrando: *" + page + "-" + (page + 10) + "*";

    for (let i = page; i < (page + 10); i++) {
        let irow = [];
        if (!inv.items[i]) continue;
        const item = await Item.findOne({
            where: {
                item_id: inv.items[i]
            }
        });
        if (!item) continue;
        irow.push({
            text: item.name,
            callback_data: "item_look " + inv.items[i]
        }, {
            text: "⚔️",
            callback_data: "equip_item " + i
        }, {
            text: "🗑️",
            callback_data: "delete_item " + i + " " + item.name
        });

        opts.reply_markup.inline_keyboard.push(irow);
    }

    opts.reply_markup.inline_keyboard.push([{
        text: "⬅️ Anterior",
        callback_data: "items " + (parseInt(page) - 10)
    }, {
        text: "Siguiente ➡️",
        callback_data: "items " + (parseInt(page) + 10)
    }]);
    let _opts = JSON.parse(JSON.stringify(opts));
    if (!seg[user_id]) seg[user_id] = { msg: msg + ".", _opts };
    if (compare(seg[user_id], { msg, opts })) {
        return { msg: false };
    }
    seg[user_id] = { msg, opts : _opts };

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

    if (data.data.includes("items ")) {
        const mod = data.data.split(" ")[1];
        const { msg, opts } = await items(user_id, mod);
        if (msg == false) return;
        opts.chat_id = chat_id;
        opts.message_id = mess_id;
        bot.editMessageText(msg, opts);
    }
    else if (data.data.includes("item_look ")) {
        const mod = data.data.split(" ")[1];
        const { msg, opts } = await itemLook(mod);
        opts.chat_id = chat_id;
        opts.message_id = mess_id;
        bot.editMessageText(msg, opts);
    }
    else if (data.data.includes("equip_item ")) {
        const mod = data.data.split(" ")[1];
        const { msg, opts } = await equipItem(user_id, mod);
        if (msg == false) return;
        opts.chat_id = chat_id;
        opts.message_id = mess_id;
        bot.editMessageText(msg, opts);
    }
    else if (data.data.includes("delete_item ")) {
        const mod = parseInt(data.data.split(" ")[1]);
        const name = data.data.split(" ")[2];
        const { msg, opts } = await delItem(user_id, mod , name);
        if(msg == false) return;
        opts.chat_id = chat_id;
        opts.message_id = mess_id;
        bot.editMessageText(msg, opts);
    }
    else if (data.data.includes("del_item_accept ")) {
        const mod = parseInt(data.data.split(" ")[1]);
        const name = data.data.split(" ")[2];
        const { msg, opts } = await delItemAccept(user_id, mod, name);
        if (msg == false) return;
        opts.chat_id = chat_id;
        opts.message_id = mess_id;
        bot.editMessageText(msg, opts);
    }
});

const delItem = async (user_id, mod, name) => {
    let opts = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "✅ Aceptar",
                        callback_data: "del_item_accept " + mod + " " + name
                    },
                    {
                        text: "❌ Cancelar",
                        callback_data: "items 0"
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

const delItemAccept = async (user_id, mod, name) => {
    const hero = await Hero.findOne({
        where: {
            user_id: user_id
        }
    });

    if (!hero) return { msg: "Esta cuenta no existe , use el comando /start para crear una." };

    const inv = JSON.parse(hero.inventory);
    if (!inv.items[mod]) return {msg : false};

    const item = await Item.findOne({
        where: {
            item_id: inv.items[mod]
        }
    });

    if (item.name != name) return {msg : false};

    inv.items.splice(mod, 1);
    
    await hero.setData({
        inventory: inv
    });

    const { msg, opts } = await items(chat_id, 0);

    return {
        msg,
        opts
    };
};

const equipItem = async (user_id, mod) => {
    const hero = await Hero.findOne({
        where: {
            user_id: user_id
        }
    });

    if (!hero) return { msg: "Esta cuenta no existe , use el comando /start para crear una." };

    if (hero.status != "rest") return { msg: "No se puede equipar objetos fuera de la ciudad." };

    const inv = JSON.parse(hero.inventory);
    const equip = JSON.parse(hero.equip);
    const total_attr = JSON.parse(hero.total_attr);

    if (!inv.items[mod]) return { msg: false };

    const ite = inv.items[mod];
    inv.items.splice(mod , 1);

    const item = await Item.findOne({
        where: {
            item_id: ite
        }
    });

    if (!item) return { msg: false };

    const heroS = { ...hero.level, ...hero.class, ...hero.expertice, ...total_attr };
    const requirements = { level: item.level, type: item.type, ...JSON.parse(item.require) };

    for (let s in requirements) {
        if (requirements[s] > heroS[s]) return { msg: "No posees los requisitos necesarios para equipar el objeto." };
    }

    const itu = equip[item.type];

    equip[item.type] = ite;
    if (itu != "na") inv.items.push(itu);

    await hero.setData({
        equip: equip,
        inventory: inv
    });

    await updateStats(user_id);

    const { msg, opts } = await items(user_id, 0);
    return { msg, opts };

}

const itemLook = async (item_id) => {
    const item = await Item.findOne({
        where: {
            item_id: item_id
        }
    });

    const opts = {
        reply_markup: {
            resize_keyboard: true,
            inline_keyboard: [
            [{ text: "Atrás ↩️", callback_data: "items 0" }]
                    ]
        },
        parse_mode: "Markdown"
    };

    if (!item) return { msg: "No se encontro el objeto.", opts };

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
        cost: "💰 Costo"
    };

    let msg = "⚔️ *Objeto:*\n\n" +
        "🆔 ID: `" + item.item_id + "`\n" +
        "🧾 Nombre: *" + item.name + "* \n" +
        "📔 Tipo: *" + item.type + "* \n" +
        "📖 Descripción: _" + item.desc + "_ \n" +
        attr_str.level + ": *" + item.level + "*\n" +
        (item.isMod ? attr_str.modLvl + ": *" + item.modLvl + "*\n" : "");
        
    const require = JSON.parse(item.require);
    if(Object.keys(require).length > 0) msg +=         "\n⚖️ Requiere:";

    for (let r in require) {
        if (!attr_str[r]) continue;
        msg += "\n" + attr_str[r] + ": *" + require[r] + "*";
    }

    msg += "\n";

    const itemD = item.getAttrData();
    let count = 0;
    for (let i in itemD) {
        if (itemD[i] == 0) continue;
        msg += "\n" + attr_str[i] + ": *" + (count > 9 ? Number(itemD[i]).toFixed(2) + "%" : itemD[i]) + "*";
        count++;
    }

    msg += "\n" + attr_str.cost + "*" + item.cost + "*";

    return {
        msg,
        opts
    }
};


bot.onText(/(\/items|🛡️ Objetos)/, async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;

    const { msg, opts } = await items(user_id);
    bot.sendMessage(chat_id, msg, opts);
});



module.exports = items;
