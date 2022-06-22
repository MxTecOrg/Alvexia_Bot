const config = require("../../config.js");
const { Sequelize, Model, DataTypes, Op } = require("sequelize");
const UserModel = require("./models/User.js");
const HeroModel = require("./models/Hero.js");
const ArenaModel = require("./models/Arena.js");
const ItemModel = require("./models/Item.js");
const ConsumableModel = require("./models/Consumable.js");
const MaterialModel = require("./models/Material.js");
const PartyModel = require("./models/Party.js");

/**********************
 * Iniciando Conexion *
 **********************/
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: config.DB + '/users.db',
    logging: false
});

const sequelize2 = new Sequelize({
    dialect: 'sqlite',
    storage: config.DB + '/object.db',
    logging: false
});


(async () => {
    try {
        await sequelize.authenticate();
        await sequelize2.authenticate();
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
 *  Modelo de Arena  *
 *********************/
class Arena extends Model {
    getData() {
        const rows = ["level", "class", "expertice", "attributes", "equip", "skills", "stats"];
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

Arena.init(
    ArenaModel(DataTypes),
    {
        sequelize
    }
);

(async () => {
    await Arena.sync();
})();


/*********************
 *  Modelo de Grupo  *
 *********************/
class Party extends Model {
    getData() {
        const rows = ["level", "class", "expertice", "attributes", "equip", "skills", "stats"];
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

Party.init(
    PartyModel(DataTypes),
    {
        sequelize
    }
);

(async () => {
    await Party.sync();
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
        sequelize : sequelize2,
        timestamps: false
    }
);

(async () => {
    await Item.sync();
})();


/*************************
 *  Modelo de Consumible *
 *************************/
class Consumable extends Model {
    getData() {
        const rows = ["pa" , "pe" , "max_pe" , "sta", "con", "str", "agl", "int", "luck", "hp", "mp"];
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

Consumable.init(
    ConsumableModel(DataTypes),
    {
        sequelize: sequelize2,
        timestamps: false
    }
);

(async () => {
    await Consumable.sync();
})();


/*************************
 *  Modelo de Materiales *
 *************************/
class Material extends Model {
    getData() {
        const rows = ["pa" , "pe" , "max_pe" , "sta", "con", "str", "agl", "int", "luck", "hp", "mp"];
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

Material.init(
    MaterialModel(DataTypes),
    {
        sequelize: sequelize2,
        timestamps: false
    }
);

(async () => {
    await Material.sync();
})();



module.exports = {
    User,
    Hero,
    Arena,
    Party,
    Item,
    Consumable,
    Material,
    Op
}
