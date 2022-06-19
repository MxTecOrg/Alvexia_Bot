const config = require("../../../../config.js");
const fs = require("fs");
const bot = require(config.DIRNAME + "/main.js");
const { User, Hero, Op , Arena } = require(config.LOGIC + "/helpers/DB.js");
const { getCity } = require(config.LOGIC + "/engine/map.js");

const arena = async (user_id, chat_id) => {
    const opts = {
        reply_markup: {
            resize_keyboard: true,
            keyboard: [
                [
                    " ⚔️ Buscar Oponente" 
                ],
                [
                    "📜 Unirse a Equipo",
                    "Crear Equipo 🧾"
                ],
                [
                    "🏘️ Ciudad",
                    "Atrás ↩️"
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

    const menu_str = "🏟️ *Arena*:\n\n" +
    "📜 Equipo: *" + (hero.arena == "na" ? "Ninguno" : arena.name) + "*\n" +
    "🔱 Indice de Arena: *" + (hero.arena == "na" ? 0 : arena.rating) + "*";
    bot.sendMessage(chat_id, menu_str, opts);
};

bot.onText(/(\/arena|Arena 🏟️)/, async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;

    arena(user_id, chat_id);
});

module.exports = arena;
