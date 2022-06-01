const attributes = {
    sta: 0,
    con: 0,
    str: 0,
    agl: 0,
    int: 0,
    luck: 0
};

const stats = {
    hp: 0,
    hp_reg: 0,
    mp: 0,
    mp_reg: 0,
    atk: 0,
    def: 0,
    crit: 0,
    dodge: 0,
    speed: 0,
};

const equip = {
    weapon: "na",
    head: "na",
    shoulders: "na",
    neck: "na",
    trinket: "na",
    chest: "na",
    pants: "na",
    gloves: "na",
    boots: "na",
    mount: "na"
};

const inventory = {
    bags: 1,
    armory: [],
    consumables: [],
    materials: [],
    items: []
};

const coins = {
    gold: 0,
    honor: 0,
    gems: 0,
    conquest: 0,
    heroism: 0
};

const friends = {
    friends: [],
    requests: [],
    invitations: [],
    ban : []
};

const quests = [{
    id: "mq1",
    status: {
        current : 0,
        total: 10
    }
}]

const HeroModel = (DataTypes) => {
    return {
        user_id: {
            type: DataTypes.INTEGER,
            unique: true,
            allowNull: false
        },
        nickname: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        level: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        },
        xp: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        class: {
            type: DataTypes.STRING,
            defaultValue: "na"
        },
        expertice: {
            type: DataTypes.STRING,
            defaultValue: "na"
        },
        attributes: {
            type: DataTypes.STRING,
            defaultValue: JSON.stringify(attributes)
        },
        total_attr: {
            type: DataTypes.STRING,
            defaultValue: JSON.stringify(attributes)
        },
        attr_points: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        stats: {
            type: DataTypes.STRING,
            defaultValue: JSON.stringify(stats)
        },
        equip: {
            type: DataTypes.STRING,
            defaultValue: JSON.stringify(equip)
        },
        inventory: {
            type: DataTypes.STRING,
            defaultValue: JSON.stringify(inventory)
        },
        coins: {
            type: DataTypes.STRING,
            defaultValue: JSON.stringify(coins)
        },
        kingdom: {
            type: DataTypes.STRING,
            defaultValue: "na"
        },
        castle: {
            type: DataTypes.STRING,
            defaultValue: "na"
        },
        party: {
            type: DataTypes.STRING,
            defaultValue: "na"
        },
        friends: {
            type: DataTypes.STRING,
            defaultValue: JSON.stringify(friends)
        },
        quests: {
            type: DataTypes.STRING,
            defaultValue: JSON.stringify(quests)
        }
    }
}

module.exports = HeroModel;
