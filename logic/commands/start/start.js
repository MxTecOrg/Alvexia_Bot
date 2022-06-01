const config = require("../../../config.js");
const bot = require(config.DIRNAME + "/main.js");
const { User, Hero, Op } = require(config.LOGIC + "/helpers/DB.js");

var newUser = {},
    typeReq = {};
    
const wlc = "Y bien recluta , a que esperas , escribe tu nombre en la inscripción para comenzar tu entrenamiento , o ya te has acobardado como todos?.\nEscribe tu nombre para continuar.";

bot.onText(/^\/start$/, async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;
    
    if(typeReq[user_id]) delete typeReq[user_id];

    if(newUser[user_id]) return bot.sendMessage(chat_id , wlc);

    const user = await User.findOne({
        where: {
            user_id: user_id
        }
    })

    if (!user) {
        newUser[user_id] = {
            nickname: "na"
        };
        typeReq[user_id] = "nickname";
        return bot.sendMessage(chat_id , wlc);
    }
});

bot.on("message", (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;

    if (typeReq[user_id]) {
        switch (typeReq[user_id]) {
            case "nickname":
                if(data.text.length < 5 || data.text.length <= 14) return bot.sendMessage(chat_id , "Que nombre mas raro recluta, venga dime tu nombre. El nombre debe tener entre 5 y 14 caracteres.");
                const char = /^[a-zA-Z0-9]+$/;
                if(!char.test(data.text)) return bot.sendMessage(chat_id , "Que nombre es ese recluta? Venga ya , dime tu verdadero nombre. Solo puede contener caracteres alfabéticos y numéricos.")
         
                newUser[user_id].nickname = data.text;
                delete typeReq[user_id];
        }
    }
})
