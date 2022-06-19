const config = require("../../../../config.js");
const fs = require("fs");
const bot = require(config.DIRNAME + "/main.js");
const { User, Hero, Op, Material } = require(config.LOGIC + "/helpers/DB.js");
const { updateStats } = require(config.LOGIC + "/engine/attr_calc.js");


const materials = async (user_id, _page) => {
    let opts = {
        parse_mode: "Markdown"
    };
    
    const hero = await Hero.findOne({
        where: {
            user_id: user_id
        }
    });
    
    if (!hero) return { msg: "Esta cuenta no existe , use el comando /start para crear una." };
    
    const inv = JSON.parse(hero.inventory);
    
    let msg = "⛏️ *Materiales:*\n";
    
    for(let mat of inv.materials){
        msg += "\n🆔 `" + mat.id + "` - " + mat.name + " : *" + mat.amount + "*";
    }
    
    msg += "\n\nUse /matdesc [id] para ver la descripción del objeto.";
    
    return {msg , opts};
};

bot.onText(/(\/arena_create|Crear Equipo 🧾)/, async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;

    const { msg, opts } = await arenaCreate(user_id);
    bot.sendMessage(chat_id, msg, opts);
});



module.exports = materials;
