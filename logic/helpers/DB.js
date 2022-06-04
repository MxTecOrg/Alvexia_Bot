const config = require("../../config.js");
const { Sequelize, Model, DataTypes, Op } = require("sequelize");
const UserModel = require("./models/User.js");
const HeroModel = require("./models/Hero.js");
const ItemModel = require("./models/Item.js");

/**********************
 * Iniciando Conexion *
 **********************/
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: config.DB + '/database.db',
    loggin: false
});

(async () => {
    try {
        await sequelize.authenticate();
    } catch (err) {
        throw new Error("" + err)
    }
})();

/*********************
 * Modelo de Usuario *
 *********************/
class User extends Model {
    getData() {
        const rows = ["user_id", "nickname", "color", "desc", "pic", "xcoins", "isOnline", "lastTimeOnline", "vip"];
        let ret = {};
        for (let row of rows) {
            if (this[row]) {
                try {
                    ret[row] = JSON.parse(this[row]);
                } catch (err) {
                    ret[row] = this[row];
                }
            }
        }
        return ret;
    }

    async setData(obj) {
        let parsedObj = {};
        for (let o in obj) {
            if (this[o] == undefined) continue;
            parsedObj[o] = (typeof(obj) === "object" ? JSON.stringify(obj[o]) : obj[o]);
        }
        try {
            await this.update(parsedObj);
            return true;
        } catch (err) {
            console.err(err);
            return false;
        }
    }
}

User.init(
    UserModel(DataTypes),
    {
        sequelize
    }
);

(async () => {
    await User.sync();
})();

/*********************
 *  Modelo de Heroe  *
 *********************/
class Hero extends Model {
    getAttrData() {
        const rows = ["level" , "class" , "expertice" , "attributes" , "equip" , "skills" , "stats"];
        let ret = {};
        for (let row of rows) {
            if (this[row]) {
                try {
                    ret[row] = JSON.parse(this[row]);
                } catch (err) {
                    ret[row] = this[row];
                }
            }
        }
        return ret;
    }

    async setData(obj) {
        let parsedObj = {};
        for (let o in obj) {
            if (this[o] == undefined) continue;
            parsedObj[o] = (typeof(obj) === "object" ? JSON.stringify(obj[o]) : obj[o]);
        }
        try {
            await this.update(parsedObj);
            return true;
        } catch (err) {
            console.err(err);
            return false;
        }
    }
}

Hero.init(
    HeroModel(DataTypes),
    {
        sequelize
    }
);

(async () => {
    await Hero.sync();
})();


/*********************
 *  Modelo de  Item  *
 *********************/
class Item extends Model {
    getAttrData() {
        const rows = ["sta" , "con" , "str" , "agl" , "int" , "luck" , "hp" ,"hp_reg" , "mp" , "mp_reg" , "atk" , "def" , "crit" , "dodge", "speed" , "xp_extra" , "gold_extra"];
        let ret = {};
        for (let row of rows) {
            if (this[row]) {
                try {
                    ret[row] = JSON.parse(this[row]);
                } catch (err) {
                    ret[row] = this[row];
                }
            }
        }
        return ret;
    }

    async setData(obj) {
        let parsedObj = {};
        for (let o in obj) {
            if (this[o] == undefined) continue;
            parsedObj[o] = (typeof(obj) === "object" ? JSON.stringify(obj[o]) : obj[o]);
        }
        try {
            await this.update(parsedObj);
            return true;
        } catch (err) {
            console.err(err);
            return false;
        }
    }
}

Item.init(
    ItemModel(DataTypes),
    {
        sequelize
    }
);

(async () => {
    await Item.sync();
})();

module.exports = {
    User,
    Hero,
    Item,
    Op
}
