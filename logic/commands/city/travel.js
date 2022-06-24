const config = require("../../../config.js");
const fs = require("fs");
const bot = require(config.DIRNAME + "/main.js");
const { User, Hero, Op } = require(config.LOGIC + "/helpers/DB.js");
const { getCity, getMap } = require(config.LOGIC + "/engine/map.js");

var seg = {};

const travel = async (user_id, x, y) => {
    const hero = await Hero.findOne({
        where: {
            user_id: user_id
        }
    });

    if (!hero) return { msg: "Esta cuenta no existe , use el comando /start para crear una." };

    let { ax, ay } = { ax: parseInt(hero.zone.split("_")[0]), ay: parseInt(hero.zone.split("_")[1]) };

    const opts = {
        parse_mode: "Markdown",
        reply_markup: {
            resize_keyboard: true,
            inline_keyboard: [
                    [{ text: "↖️", callback_data: "map " + (x ? x - 1 : ax - 1) + " " + (y ? y - 1 : ay - 1) }, { text: "⬆️", callback_data: "map " + (x ? x - 1 : ax - 1) + " " + (y ? y : ay) }, {
                    text: "↗️",
                    callback_data: "map " + (x ? x - 1 : ax - 1) + " " + (y ? y + 1 : ay + 1)
                    }],
                    [{ text: "⬅️", callback_data: "map " + (x ? x : ax) + " " + (y ? y - 1 : ay - 1) }, { text: "🐾 Viajar", callback_data: "travel " + (x ? x : ax) + " " + (y ? y : ay) }, { text: "➡️", callback_data: "map " + (x ? x : y) + " " + (y ? y + 1 : ay + 1) }],
                    [{
                        text: "↙️",
                        callback_data: "map " + (x ? x + 1 : ax + 1) + " " + (y ? y - 1 : ay - 1)
                    },
                    { text: "⬇️", callback_data: "map " + (x ? x + 1 : ax + 1) + " " + (y ? y : ay) }, {
                        text: "↘️",
                        callback_data: "map " + (x ? x + 1 : ax + 1) + " " + (y ? y + 1 : ay + 1)
                    }]
                ]
        }
    }

    const _map = getMap();

    if (x < 0) x = 0;
    if (x >= _map.length) x = (_map.length - 1);
    if (y < 0) y = 0;
    if (y >= _map[0].length) y = (_map[0].length - 1);

    const city = getCity((x ? x : ax) + "_" + (y ? y : ay));

    let msg = "🗺️ *Viajar:*\n\n" +
        "🌐 Coordenadas: `x:" + (x ? x : ax) + " y:" + (y ? y : ay) + "`\n";

    if (city == "na") {
        msg += "⚒️ Esta ciudad aun no a sido fundada.";
    } else {
        msg += "🏘️ Ciudad: *" + city.name + "*\n" +
            "_" + city.desc + "_\n" +
            "🆙 Nivel: *" + city.level.min + "-" + city.level.max + "*";
    }

    const tt = travelTime({ x, y }, { x: ax, y: ay });

    msg += "\n\n⚡ Costo de Energía: *" + tt + "*\n" +
        "⏳ Tiempo de Viaje: *" + (tt * 30) + "min*";

    let _opts = JSON.parse(JSON.stringify(opts));
    if (!seg[user_id]) seg[user_id] = { msg: msg + ".", _opts };
    if (compare(seg[user_id], { msg, opts })) {
        return { msg: false };
    }
    seg[user_id] = { msg, opts: _opts };

    return { msg, opts };
};

const travelTime = (a, b) => {
    let energy = 0;
    if (a.x > b.x) {
        while (a.x > b.x) {
            a.x--;
            energy++;
            if (a.y > b.y) a.y--;
            else if (a.y < b.y) a.y++;
        }
    } else
        while (a.x < b.x) {
            a.x++;
            energy++;
            if (a.y < b.y) a.y++;
            else if (a.y > b.y) a.y--;
        }
    if (a.y > b.y) {
        while (a.y > b.y) {
            a.y--;
            energy++;
        }
    } else
        while (a.y < b.y) {
            a.y++;
            energy++;
        }

    return energy;
}

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
    
    if(data.data.includes("map ")){
        const {x , y} = {x: parseInt(data.data.split(" ")[1]) , y: parseInt(data.data.split(" ")[2])};
        const { msg, opts } = await travel(user_id , x , y);
        if (msg == false) return;
        opts.chat_id = chat_id;
        opts.message_id = mess_id;
        bot.editMessageText( msg, opts);
    }
});

bot.onText(/(\/travel|Viajar 🗺️)/, async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;

    const { msg, opts } = await travel(user_id);
    if (msg == false) return;
    bot.sendMessage(chat_id, msg, opts);
});


module.exports = travel;
