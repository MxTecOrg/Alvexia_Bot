const config = require("../../../config.js");
const fs = require("fs");
const bot = require(config.DIRNAME + "/main.js");
const { User, Hero, Op , Item} = require(config.LOGIC + "/helpers/DB.js");

var seg = {};

const items = async (user_id, page) => {
    let opts = {
        reply_markup: {
            inline_keyboard: [
                [
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

    const inv = JSON.parse(hero.inventory);

    if (!page || page < 0 || page >= inv.items.length) page = 0;
    let msg = "🛡️ *Objetos:* \n\n" +
        "🎒 Espacio: *" + inv.items.length + "/" + (inv.bags * 10) + "*\n" +
        "📜 Mostrando: *" + page + "-" + (page + 10) + "*";

    for (let i = page; i < (page + 10); i++) {
        let irow = [];
        if (!inv.items[i]) continue;
        const item = Item.findOne({
            where: {
                item_id: inv.items[i]
            }
        });

        irow.push({
            text: item.name,
            callback_data: "item_look " + inv.items[i]
        }, {
            text: "⚔️",
            callback_data: "equip " + i
        }, {
            text: "🗑️",
            callback_data: "del_item " + i
        });

        opts.reply_markup.inline_keyboard.push(irow);
    }

    opts.reply_markup.inline_keyboard.push([{
        text: "⬅️ Anterior",
        callback_data: "items " + (page - 10)
    }, {
        text: "Siguiente ➡️",
        callback_data: "items " + (page + 10)
    }]);

    return { msg, opts };
};

bot.on("callback_query", async (data) => {
    const user_id = data.from.id;
    const chat_id = data.message.chat.id;
    const mess_id = data.message.message_id;

    if (data.data.includes("items ")) {
        const mod = data.data.split(" ")[1];
        const { msg, opts } = await items(user_id , mod);
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
});

const itemLook = async (item_id) => {
    const item = await Item.findOne({
        where : {
            item_id : item_id
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
    
    if(!item) return {msg : "No se encontro el objeto." , opts};
    
    
    
    const attr_str = {
        level: "🆙 Nivel",
        class: "⚜️ Clase",
        expertice: "🔰 Maestria",
        modLvl : "🔨 Mod",
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
        cost : "💰 Costo"
    };
    
    let msg = "⚔️ *Objeto:*\n\n" +
        "🧾 Nombre: *" + item.name + "* \n" +
        "📖 Descripción: _" + item.desc + "_ \n" + 
        attr_str.level + ": *" + item.level + "*\n" +
        (item.isMod ? attr_str.modLvl + ": *" + item.modLvl + "*\n" : "") + 
        "\n⚖️ Requiere:";
        
    for(let r in require){
        if(!attr_str[r]) continue;
        msg += "\n" + attr_str[r] + ": *" + require[r] + "*";
    }
    
    msg += "\n";
    
    const itemD = item.getAttrData();
    for (let i in itemD) {
        if (itemD[i] == 0) continue;
        msg += "\n" + attr_str[i] + ": *" + itemD[i] + (i > 9 ? (itemD[i]).toFixed(2) : itemD[i]) + "*";
    }
    
    msg += "\n" + attr_str.cost + "*" + itemD.cost + "*";
    
    return {
        msg,
        opts
    }
};


const equip = async (user_id , item) => {
    const hero = await Hero.findOne({
        where : {
            user_id : user_id
        }
    });
    
    
    if (!hero) return { msg: "Esta cuenta no existe , use el comando /start para crear una." };
    
};

bot.onText(/(\/items|🛡️ Objetos)/, async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;

    const { msg, opts } = await items(user_id);
});



module.exports = items;
