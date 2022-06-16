const config = require("../../../config.js");
const fs = require("fs");
const bot = require(config.DIRNAME + "/main.js");
const { Hero, Op } = require(config.LOGIC + "/helpers/DB.js");
const attr_db = JSON.parse(fs.readFileSync(config.DB + "/attr_db.json", "utf-8"));
const { updateStats } = require(config.LOGIC + "/engine/attr_calc.js");

const pa = async (user_id) => {
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

    const attributes = JSON.parse(hero.attributes);
    const attr_points = JSON.parse(hero.attr_points);

    const attr_str = {
        "sta": "♥️ Vit",
        "con": "🔷 Con",
        "str": "💪🏻 Fue",
        "agl": "🦶🏻 Agi",
        "int": "🧠 Int",
        "luck": "🍀 Sue"
    };

    for (let a in attributes) {
        let irow = [];
        irow.push({
            text: attr_str[a] + " - " + attributes[a],
            callback_data: "show_attr " + a
        }, {
            text: "➕",
            callback_data: "add_attr " + a + " " + 1
        }, {
            text: "➕ 5",
            callback_data: "add_attr " + a + " " + 5
        });
        opts.reply_markup.inline_keyboard.push(irow);

    }
    
    opts.reply_markup.inline_keyboard.push([{text : "♻️ Reiniciar PA" , callback_data: "reset_pa"}]);

    const msg = "💡 *Puntos de Atributos:*\n\n" +
        "📜 Puntos: *" + attr_points.points + "* \n" +
        "📃 Usados: *" + attr_points.spend + "*";
    return { msg, opts }
};


bot.onText(/(\/pa|PA 💡)/, async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;

    const { msg, opts } = await pa(user_id);
    bot.sendMessage(chat_id, msg, opts);
});

const show_attr = async (mod) => {
    const attr_str = {
        "sta": "♥️ Vitalidad",
        "con": "🔷 Concentración",
        "str": "💪🏻 Fuerza",
        "agl": "🦶🏻 Agilidad",
        "int": "🧠 Intelecto",
        "luck": "🍀 Suerte"
    };

    const sta_str = {
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

    const opts = {
        reply_markup: {
            resize_keyboard: true,
            inline_keyboard: [
            [{ text: "Atrás ↩️", callback_data: "pa" }]
                    ]
        },
        parse_mode: "Markdown"
    };

    let msg = "Cada punto de " + attr_str[mod] + " concede: \n";

    for (let a in attr_db[mod]) {
        msg += "\n" + sta_str[a] + ": *" + attr_db[mod][a] + "*";
    }
    return {
        msg,
        opts
    };
};


bot.on("callback_query", async (data) => {
    const user_id = data.from.id;
    const chat_id = data.message.chat.id;
    const mess_id = data.message.message_id;

    if (data.data.includes("show_attr ")) {
        const mod = data.data.split(" ")[1];
        const { msg, opts } = await show_attr(mod);
        opts.chat_id = chat_id;
        opts.message_id = mess_id;
        bot.editMessageText(msg, opts);
    }

    else if (data.data.includes("add_attr ")) {
        const mod = data.data.split(" ")[1];
        const cant = parseInt(data.data.split(" ")[2]);
        const add = await add_attr(user_id, mod, cant);
        if (add == false) return;

        const { msg, opts } = await pa(user_id);
        opts.chat_id = chat_id;
        opts.message_id = mess_id;
        bot.editMessageText(msg, opts);
    }
    else if (data.data == "pa"){
        const { msg, opts } = await pa(user_id);
        opts.chat_id = chat_id;
        opts.message_id = mess_id;
        bot.editMessageText(msg, opts);
    }
});

const add_attr = async (user_id, mod, cant) => {
    const hero = await Hero.findOne({
        where: {
            user_id: user_id
        }
    });

    if (!hero) return { msg: "Esta cuenta no existe , use el comando /start para crear una." };

    const attributes = JSON.parse(hero.attributes);
    const attr_points = JSON.parse(hero.attr_points);

    if (attr_points.points < cant) return false;
    attributes[mod] += cant;
    attr_points.points -= cant;
    attr_points.spend += cant;

    await hero.setData({
        attributes: attributes,
        attr_points: attr_points
    });
    
    await updateStats(user_id);

    return true;
}
