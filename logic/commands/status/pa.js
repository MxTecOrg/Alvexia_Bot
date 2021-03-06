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
        "sta": "β₯οΈ Vit",
        "con": "π· Con",
        "str": "πͺπ» Fue",
        "agl": "π¦Άπ» Agi",
        "int": "π§  Int",
        "luck": "π Sue"
    };

    for (let a in attributes) {
        let irow = [];
        irow.push({
            text: attr_str[a] + " - " + attributes[a],
            callback_data: "show_attr " + a
        }, {
            text: "β",
            callback_data: "add_attr " + a + " " + 1
        }, {
            text: "β 5",
            callback_data: "add_attr " + a + " " + 5
        });
        opts.reply_markup.inline_keyboard.push(irow);

    }
    
    opts.reply_markup.inline_keyboard.push([{text : "β»οΈ Reiniciar PA" , callback_data: "reset_pa"}]);

    const msg = "π‘ *Puntos de Atributos:*\n\n" +
        "π Puntos: *" + attr_points.points + "* \n" +
        "π Usados: *" + attr_points.spend + "*";
    return { msg, opts }
};


bot.onText(/(\/ap|PA π‘)/, async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;

    const { msg, opts } = await pa(user_id);
    bot.sendMessage(chat_id, msg, opts);
});

const show_attr = async (mod) => {
    const attr_str = {
        "sta": "β₯οΈ Vitalidad",
        "con": "π· ConcentraciΓ³n",
        "str": "πͺπ» Fuerza",
        "agl": "π¦Άπ» Agilidad",
        "int": "π§  Intelecto",
        "luck": "π Suerte"
    };

    const sta_str = {
        hp: "β₯οΈ Vida",
        hp_reg: "π΄ Reg. Vida",
        mp: "π· Mana",
        mp_reg: "π΅ Reg. Mana",
        atk: "π‘οΈ Ataque",
        def: "π‘οΈ Defensa",
        crit: "π― CrΓ­tico",
        dodge: "π EvasiΓ³n",
        speed: "π« Velocidad",
        xp_extra: "π‘ XP Extra",
        gold_extra: "π° Oro Extra"
    };

    const opts = {
        reply_markup: {
            resize_keyboard: true,
            inline_keyboard: [
            [{ text: "AtrΓ‘s β©οΈ", callback_data: "pa" }]
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
