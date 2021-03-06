const config = require("../../../config.js");
const fs = require("fs");
const bot = require(config.DIRNAME + "/main.js");
const { User, Hero, Op, Item } = require(config.LOGIC + "/helpers/DB.js");
const { updateStats } = require(config.LOGIC + "/engine/attr_calc.js");

const equipment = async (user_id, chat_id) => {
    const opts = {
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

    if (!hero) return { msg: "Esta cuenta no existe , use el comando /start para crear una." };

    const equip = JSON.parse(hero.equip);

    const equip_str = {
        weapon: "๐ก๏ธ Arma",
        head: "๐ฉ Casco",
        shoulders: "๐ก๏ธ Hombreras",
        neck: "๐ฟ Collar",
        trinket: "โจ Aretes",
        ring: "๐ Anillo",
        chest: "๐ Pecho",
        pants: "๐ Pantalones",
        gloves: "๐งค Guantes",
        boots: "๐ฅพ Botas",
        mount: "๐ฅ Montura"
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
                item_id: equip[eq]
            }
        });
        if (!item) {
            irow.push({
                text: equip_str[eq] + " - Nada",
                callback_data: "none"
            }, {
                text: "โ",
                callback_data: "unequip_item " + eq
            });
            opts.reply_markup.inline_keyboard.push(irow);
            continue;
        }

        irow.push({
            text: equip_str[eq] + " - " + item.name,
            callback_data: "equip_look " + eq
        }, {
            text: "โ",
            callback_data: "unequip_item " + eq
        });
        opts.reply_markup.inline_keyboard.push(irow);


    }

    const msg = "๐ก๏ธ *Equipamiento:*";
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

    else if (data.data.includes("unequip_item ")) {
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
        [{ text: "Atrรกs โฉ๏ธ", callback_data: "equipment" }]
                ]
        },
        parse_mode: "Markdown"
    };
    
    if(hero.status != "rest") {
        return {
            msg: "No puedes desequiparte fuera de la ciudad.",
            opts
        };
    }
    
    
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
    
    inventory.items.push(item.item_id);
    equip[mod] = "na";
    await hero.setData({
        inventory : inventory,
        equip : equip
    });
    await updateStats(user_id);
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
    [{ text: "Atrรกs โฉ๏ธ", callback_data: "equipment" }]
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
        sta: "โฅ๏ธ Vitalidad",
        con: "๐ท Concentraciรณn",
        str: "๐ช๐ป Fuerza",
        agl: "๐ฆถ๐ป Agilidad",
        int: "๐ง? Intelecto",
        luck: "๐ Suerte",
        hp: "โฅ๏ธ Vida",
        hp_reg: "๐ด Reg. Vida",
        mp: "๐ท Mana",
        mp_reg: "๐ต Reg. Mana",
        atk: "๐ก๏ธ Ataque",
        def: "๐ก๏ธ Defensa",
        crit: "๐ฏ Crรญtico",
        dodge: "๐ Evasiรณn",
        speed: "๐ซ Velocidad",
        xp_extra: "๐ก XP Extra",
        gold_extra: "๐ฐ Oro Extra"
    };

    let msg = "โ๏ธ *Objeto:*\n\n" +
        "๐งพ Nombre: *" + item.name + "* \n" +
        "๐ Descripciรณn: _" + item.desc + "_ ";
    let count = 0;
    const itemD = item.getAttrData();
    for (let i in itemD) {
        if (itemD[i] == 0) continue;
        msg += "\n" + attr_str[i] + ": *" + itemD[i] + (count > 9 ? Number(itemD[i]).toFixed(2) + "%": itemD[i]) + "*";
        count++;
    }

    return {
        msg,
        opts
    }

};

bot.onText(/(\/equipment|Equipo ๐ก๏ธ)/, async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;

    const { msg, opts } = await equipment(user_id, chat_id);
    bot.sendMessage(chat_id, msg, opts);
});
