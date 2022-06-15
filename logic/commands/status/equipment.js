const config = require("../../../config.js");
const fs = require("fs");
const bot = require(config.DIRNAME + "/main.js");
const { User, Hero, Op, Item } = require(config.LOGIC + "/helpers/DB.js");

const equipment = async (user_id, chat_id) => {
    const opts = {
        reply_markup: {
            resize_keyboard: true,
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

    if (!hero) return { msg: "Esta cuenta no existe , use el comando /start para crear una." };

    const equip = JSON.parse(hero.equip);

    const equip_str = {
        weapon: "🗡️ Arma",
        head: "🎩 Casco",
        shoulders: "🛡️ Hombreras",
        neck: "📿 Collar",
        trinket: "✨ Aretes",
        ring: "💍 Anillo",
        chest: "👕 Pecho",
        pants: "👖 Pantalones",
        gloves: "🧤 Guantes",
        boots: "🥾 Botas",
        mount: "🐥 Montura"
    };

    for (let eq in equip) {
        let irow = [];


        if (equip[eq] == "na") {
            irow.push({
                text: equip_str[eq] + " - Nada",
                callback_data: "none"
            });
            opts.reply_markup.inline_keyboard.push(irow);
            continue;
        }
        const item = await Item.findOne({
            where: {
                item_id: equip
            }
        });
        if (!item) {
            irow.push({
                text: equip_str[eq] + " - Nada",
                callback_data: "none"
            }, {
                text: "❌",
                callback_data: "unequip " + eq
            });
            opts.reply_markup.inline_keyboard.push(irow);
            continue;
        }

        irow.push({
            text: equip_str[eq] + " - " + item.name,
            callback_data: "equip_look " + eq
        }, {
            text: "❌",
            callback_data: "unequip " + eq
        });
        opts.reply_markup.inline_keyboard.push(irow);


    }

    const msg = "🛡️ *Equipamiento:*";
    return { msg, opts }
};

bot.on("callback_query", async (data) => {
    const user_id = data.from.id;
    const chat_id = data.message.chat.id;
    const mess_id = data.message.message_id;

    if (data.data.includes("equip_look ")) {
        const mod = data.data.split(" ")[1];
        const { msg, opts } = await equipLook(user_id, mod);
        opts.chat_id = chat_id;
        opts.message_id = mess_id;
        bot.editMessageText(msg, opts);
    }

    else if (data.data.includes("unequip ")) {
        const mod = data.data.split(" ")[1];
        const { msg, opts } = await unequip(user_id, chat_id , mod);
        opts.chat_id = chat_id;
        opts.message_id = mess_id;
        bot.editMessageText(msg, opts);
    }
    else if (data.data == "equipment") {
        const { msg, opts } = await equipment(user_id, chat_id);
        opts.chat_id = chat_id;
        opts.message_id = mess_id;
        bot.editMessageText(msg, opts);
    }
});

const unequip = async (user_id , chat_id ,mod) => {
    const hero = await Hero.findOne({
        where: {
            user_id: user_id
        }
    });
    
    const equip = JSON.parse(hero.equip);
    const inventory = JSON.parse(hero.inventory);
    
    const opts = {
        reply_markup: {
            resize_keyboard: true,
            inline_keyboard: [
        [{ text: "Atrás ↩️", callback_data: "equipment" }]
                ]
        },
        parse_mode: "Markdown"
    };
    
    
    if (!equip[mod]) {
        return {
            msg: "No se encontro el objeto.",
            opts: opts
        }
    }
    
    const item = await Item.findOne({
        where: {
            item_id: equip[mod]
        }
    });
    
    
    if (!item) {
        return {
            msg: "No se encontro el objeto.",
            opts: opts
        };
    }
    
    if(inventory.items.length >= (inventory.bags * 10)){
        return {
            msg : "El inventario se encuentra lleno",
            opts : opts
        };
    }
    
    inventory.items.push(item.id);
    equip[mod] = "na";
    await hero.setData({
        inventory : inventory,
        equip : equip
    });
    return (await equipment(user_id , chat_id));
};

const equipLook = async (user_id, mod) => {
    const hero = await Hero.findOne({
        where: {
            user_id: user_id
        }
    });

    const equip = JSON.parse(hero.equip);

    const opts = {
        reply_markup: {
            resize_keyboard: true,
            inline_keyboard: [
    [{ text: "Atrás ↩️", callback_data: "equipment" }]
            ]
        },
        parse_mode: "Markdown"
    };


    if (!equip[mod]) {
        return {
            msg: "No se encontro el objeto.",
            opts: opts
        }
    }

    const item = await Item.findOne({
        where: {
            item_id: equip[mod]
        }
    });


    if (!item) {
        return {
            msg: "No se encontro el objeto.",
            opts: opts
        }
    }

    const attr_str = {
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
        gold_extra: "💰 Oro Extra"
    };

    let msg = "⚔️ *Objeto:*\n\n" +
        "🧾 Nombre: *" + item.name + "* \n" +
        "📖 Descripción: _" + item.desc + "_ ";

    const itemD = item.getAttrData();
    for (let i in itemD) {
        if (itemD[i] == 0) continue;
        msg += "\n" + attr_str[i] + ": *" + itemD[i] + (i > 10 ? parseFloat(itemD[i]).toFixed(2) : itemD[i]) + "*";
    }

    return {
        msg,
        opts
    }

};

bot.onText(/(\/equipment|Equipo 🛡️)/, async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;

    const { msg, opts } = await equipment(user_id, chat_id);
    bot.sendMessage(chat_id, msg, opts);
});
