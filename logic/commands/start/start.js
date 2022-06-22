const config = require("../../../config.js");
const bot = require(config.DIRNAME + "/main.js");
const { User, Hero, Op } = require(config.LOGIC + "/helpers/DB.js");
const menu = require(config.LOGIC + "/commands/menu/menu.js");
const { updateStats, fillHeal } = require(config.LOGIC + "/engine/attr_calc.js");

var newUser = {},
    typeReq = {};

const wlc = "Y bien recluta , a que esperas , escribe tu nombre en la inscripción para comenzar tu entrenamiento , o ya te has acobardado como todos?.\nEscribe tu nombre para continuar.";

const a_str = "Estas seguro que este es tu nombre?";

const err_str = "Ocurrió un error rellenando tu formulario , por favor inserta nuevamente su nombre. Si este error persiste dirijase a uno de nuestros instructores (@franky96lol)";

const wlc2_1 = "Pues bienvenid@ '";
const wlc2_2 = "' a el cuartel de entrenamiento. Dia a dia estaremos intentando convertirlos en valerosos guerreros , yo Elbaf seré su entrenador personal."
const wlc3 = "Para comenzar el entrenamiento dirigete a 🗺️ Quests en el menu inferior. Para acceder al menu siempre puedes usar el comando /menu";

bot.onText(/^\/start.*/, async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;

    if (newUser[user_id]) {
        if (!newUser[user_id].nickname) return bot.sendMessage(chat_id, wlc);
    }

    const user = await User.findOne({
        where: {
            user_id: user_id
        }
    })

    if (!user) {
        newUser[user_id] = {
            nickname: "na",
            refBy : data.text.split(" ")[1]
        };
        typeReq[user_id] = "nickname";
        return bot.sendMessage(chat_id, wlc);
    }
});

bot.on("message", async (data) => {
    const user_id = data.from.id;
    const chat_id = data.chat.id;

    if (typeReq[user_id]) {
        switch (typeReq[user_id]) {
            case "nickname":
                if (data.text.length < 4 || data.text.length > 14) return bot.sendMessage(chat_id, "Que nombre mas raro recluta, venga dime tu nombre. El nombre debe tener entre 4 y 14 caracteres.");
                const char = /^[a-zA-Z0-9]+$/;
                if (!char.test(data.text)) return bot.sendMessage(chat_id, "Que nombre es ese recluta? Venga ya , dime tu verdadero nombre. Solo puede contener caracteres alfabéticos y numéricos.");
                const hero = await Hero.findOne({
                    where: {
                        nickname: data.text
                    }
                });
                if (hero) return bot.sendMessage(chat_id, "Mmm... Al parecer hay otro recluta con este nombre, como te llamamos?. Inserta otro nombre.");

                newUser[user_id].nickname = data.text;
                delete typeReq[user_id];

                const opts = {
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: "✅ Aceptar",
                                callback_data: "start_accept"
                            }, {
                                text: "Rechazar ❌",
                                callback_data: "start_decline"
                            }]
                        ]
                    }
                }

                bot.sendMessage(chat_id, a_str, opts);
        }
    }
});

bot.on("callback_query", async (data) => {
    const user_id = data.from.id;
    const chat_id = data.message.chat.id;
    const mess_id = data.message.message_id;

    if(data.data.includes("start")) switch (data.data) {
        case "start_accept":
            bot.deleteMessage(chat_id, mess_id);
            if (newUser[user_id].nickname) {
                const friends = {
                    friends: [],
                    refBy : ""
                }
                
                const ref = await Hero.findOne({
                    where: {
                        user_id : newUser[user_id].refBy
                    }
                });
                
                if(ref){
                    friends.refBy = newUser[user_id].refBy;
                    let refFriends = JSON.parse(ref.friends);
                    refFriends.friends.push(user_id);
                    ref.setData({
                        friends : refFriends
                    });
                    bot.sendMessage(ref.chat_id, "El heroe '" + newUser[user_id].nickname + "' se a unido al mundo usando tu link de referencia.");
                }
                
                const hero = await Hero.create({
                    user_id: user_id,
                    nickname: newUser[user_id].nickname,
                    friends: JSON.stringify(friends)
                });
                if (!hero) {
                    typeReq[user_id] = "nickname";
                    return bot.sendMessage(chat_id, err_str);
                }
                
                const user = await User.create({
                    user_id: user_id,
                    chat_id: chat_id
                });
                if (!user) {
                    typeReq[user_id] = "nickname";
                    return bot.sendMessage(chat_id, err_str);
                }
                await updateStats(user_id);
                await fillHeal(user_id);

                await bot.sendMessage(chat_id, wlc2_1 + newUser[user_id].nickname + wlc2_2);
                await bot.sendMessage(chat_id, wlc3);
                menu(user_id, chat_id);

                delete newUser[user_id];
                delete typeReq[user_id];
            }
            break;
        default:
            bot.deleteMessage(chat_id, mess_id);
            typeReq[user_id] = "nickname";
            bot.sendMessage(chat_id, wlc);
            break;
    }
});
