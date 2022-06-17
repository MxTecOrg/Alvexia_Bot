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
    const page = parseInt(_page);
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
            callback_data: "del_consumable " + i + " " + con.name
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

    if (!seg[user_id]) seg[user_id] = { msg: msg + ".", opts };
    if (false == compareInline(seg[user_id], { msg, opts })) {
        return { msg: false };
    }
    seg[user_id] = { msg, opts };

    return { msg, opts };
};

const compareInline = (inl1, inl2) => {
    if (!inl1 || !inl2) return false;
    if (!inl1.msg || !inl1.opts || !inl2.msg || !inl2.opts) return false;
    if (inl1.msg != inl2.msg) return true;
    if (inl1.opts.reply_markup.inline_keyboard != inl2.opts.reply_markup.inline_keyboard) return true;
    if (inl1.opts.reply_markup.inline_keyboard.length != inl2.opts.reply_markup.inline_keyboard.length) return true;
    for (let i in inl1.opts.reply_markup.inline_keyboard) {
        if (!inl2.opts.reply_markup.inline_keyboard[i]) return true;
        if (inl1.opts.reply_markup.inline_keyboard[i][0].text != inl2.opts.reply_markup.inline_keyboard[i][0].text) return true;
    }
    return false;
}

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


bot.on("callback_query", async (data) => {
    const user_id = data.from.id;
    const chat_id = data.message.chat.id;
    const mess_id = data.message.message_id;

    if (data.data.includes("consumables ")) {
        const mod = data.data.split(" ")[1];
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
});


bot.onText(/(\/consumables|Consumibles 🧪)/, async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;

    const { msg, opts } = await consumables(user_id);
    bot.sendMessage(chat_id, msg, opts);
});



module.exports = consumables;
