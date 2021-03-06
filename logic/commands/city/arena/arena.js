const config = require("../../../../config.js");
const fs = require("fs");
const bot = require(config.DIRNAME + "/main.js");
const { User, Hero, Op , Arena } = require(config.LOGIC + "/helpers/DB.js");
const { getCity } = require(config.LOGIC + "/engine/map.js");
require("./create.js");
require("./join.js");
require("./leave.js");


const arena = async (user_id, chat_id) => {
    const opts = {
        reply_markup: {
            resize_keyboard: true,
            keyboard: [
                [
                    " βοΈ Buscar Oponente" 
                ],
                [
                    "π Unirse a Equipo",
                    "Crear Equipo π§Ύ"
                ],
                [
                    "ποΈ Ciudad",
                    "AtrΓ‘s β©οΈ"
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

    if (!hero) return bot.sendMessage(chat_id, "Esta cuenta no existe , use el comando /start para crear una.");
    
    let arena;
    if(hero.arena != "na"){
        arena = await Arena.findOne({
            where: {
                arena_id : hero.arena
            }
        });
    }

    const menu_str = "ποΈ *Arena*:\n\n" +
    "π Equipo: *" + (hero.arena == "na" ? "Ninguno" : arena.name) + "*\n" +
    (arena ? "π : `" + arena.arena_id + "`\n" : "") +
    "π± Indice de Arena: *" + (hero.arena == "na" ? 0 : arena.rating) + "*\n" +
    "π« Entradas: *" + (hero.arena == "na" ? 0 : arena.entries) + "*";
    bot.sendMessage(chat_id, menu_str, opts);
};

bot.onText(/(\/arena|Arena ποΈ)/, async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;

    arena(user_id, chat_id);
});

module.exports = arena;
