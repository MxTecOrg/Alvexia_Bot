const config = require("../../config.js");
const fs = require("fs");
const { Hero } = require(config.LOGIC + "/helpers/DB.js");
const attrDB = JSON.parse(fs.readFileSync(config.DB + "/attr_db.json"));

const updateStats = async (user_id) => {
    const hero = await Hero.findOne({
        where : {
            user_id : user_id
        }
    });
    
    if(!hero) return null;
    
    let stats = {
        hp: 0,
        hp_reg: 0,
        mp: 0,
        mp_reg: 0,
        atk: 0,
        def: 0,
        crit: 0,
        dodge: 0,
        speed: 0,
        xp_extra: 0,
        gold_extra: 0
    };
    
    let attr = {
        sta: 0,
        con: 0,
        str: 0,
        agl: 0,
        int: 0,
        luck: 0
    };
    
    const attrs = Object.keys(attr);
    
    const heroData = hero.getAttrData();
    
    const baseAttr = heroData.attributes;
    const equip = heroData.equip;
    const pasives = [heroData.skills.p_1 , heroData.skills.p_2];
    
    attr = baseAttr;
    
    for(let eq in equip){
        if(equip[eq] == "na") continue;
        
        const item = await Item.findOne({
            where : {
                item_id : equip[eq]
            }
        });
        if(!item) continue;
        const i_attr = item.getAttrData();
        
        for(let a in i_attr){
            if(attrs.includes(a)) attr[a] += i_attr[a];
            else stats[a] += i_attr[a];
        }
    }
    
    for(let s of pasives){
        if(s == "na") continue;
    }
    
    for(let a in attr){
        for(let aa in attrDB[a]){
            stats[aa] += (attrDB[a][aa] * attr[a])
        }
    }
    
    const updt = await hero.setData({
        total_attr : attr,
        stats : stats
    });
    
    if(updt) return true;
    else return false;
};

const fillHeal = async (user_id) => {
    const hero = await Hero.findOne({
        where : {
            user_id : user_id
        }
    });
    
    if(!hero) return null;
    
    const attr = hero.getAttrData();
    hero.setData({
        hp: attr.stats.hp,
        mp: attr.stats.mp
    });
};

var energyTimer = {} , toEnd = {};
const ENERGY_REG_TIME = 30 * 60 * 1000;
const TICK = 1 * 60 * 1000;

const energyReg = async (user_id) => {
    if(energyTimer[user_id]) return null;
    
    const hero = await Hero.findOne({
        where : {
            user_id : user_id
        }
    });
    
    if(!hero) return null;
    if(hero.energy >= hero.max_energy) return null;
    
    toEnd[user_id] = ENERGY_REG_TIME;
    energyTimer[user_id].setInterval(async () => {
        toEnd[user_id] -= TICK;
        if(toEnd[user_id] <= 0) {
            clearInterval(energyTimer[user_id]);
            delete energyTimer[user_id];
            delete toEnd[user_id];
            
            const hero = await Hero.findOne({
                where: {
                    user_id: user_id
                }
            });
            
            if(hero.energy < hero.max_energy){
                await hero.setData({
                    energy : hero.energy + 1
                });
                energyReg(user_id);
            }
        }
    } , TICK);
};

const getEnergyTime = async (user_id) => {
    return (toEnd[user_id] ? toEnd[user_id] : null);
};

module.exports = {
    updateStats,
    fillHeal,
    energyReg,
    getEnergyTime
};
