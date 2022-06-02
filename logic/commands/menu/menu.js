const config = require("../../../config.js");
const bot = require(config.DIRNAME + "/main.js");
const { User, Hero, Op } = require(config.LOGIC + "/helpers/DB.js");

const menu = async (user_id , chat_id) => {
    const opts = {
        reply_markup: {
            resize_keyboard : true,
            keyboard: [
                [
                    "🌲 Bosque " ,
                    " Quests 🗺️"
                ],
                [
                    "🏘️ Zona ",
                    " Estado 👤"
                ],
                [
                    "🎒 Inventario ",
                    " Social 💬"
                ],
                [
                    "💌 Comunidad " ,
                    " Ajustes ⚙️"
                ]
            ]
        }
    };
    
    const user = await User.findOne({
        user_id : user_id
    });
    
    const hero = await Hero.findOne({
        user_id : user_id
    });
    
    if(!user || !hero) return bot.sendMessage(chat_id , "Esta cuenta no existe , use el comando /start para crear una.");
    
    const menu_str = `👤 Estado 👤
    
    ⚡ Energia: ${hero.energy}/${hero.max_energy}
    🆙 Nivel: ${hero.level} \t\t 🧠 XP: ${hero.xp}/${100}
    ♥️ Salud: ${100}/${100} \t\t 🔷 Mana: ${100}/${100}
    🗺️ Zona: ${hero.zone}
    💫 Acción: ${"attack"}`;
    bot.sendMessage(chat_id , menu_str , opts);
};

bot.onText(/\/menu/ , async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;
    
    menu(user_id , chat_id);
});

module.exports = menu;
