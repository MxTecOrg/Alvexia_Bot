const config = require("../../config.js");
const bot = require(config.DIRNAME + "/main.js");
const { Hero } = require(config.LOGIC + "/helpers/DB.js");
const fs = require("fs");

var QUESTS = {};

const checkKillQuests = async (user_id, enemiesKilled) => {
    const hero = await Hero.findOne({
        where: {
            user_id: user_id
        }
    });
    let quests = JSON.parse(hero.quests);
    for (let q in quests) {
        if (QUESTS[quests[q].id].type != "kill") continue;
        if (quests[q].current >= quests[q].total) continue;
        for (let enemy of enemiesKilled) {
            if (QUESTS[quests[q].id].goal.require == enemy) quests[q].current++;
        }
    }

    await hero.setData({
        quests: quests
    });
};

const getQuests = () => {
    return QUESTS;
};

const load = () => {
    const quests = fs.readdirSync(config.DB + "/quests/");

    for (let quest of quests) {
        const name = quest.replace(".json", "");
        QUESTS[name] = JSON.parse(fs.readFileSync(config.DB + '/quests/' + quest , "utf-8"));
    }

    console.log("Quests loaded...");
};


module.exports = {
    load,
    checkKillQuests,
    getQuests
}
