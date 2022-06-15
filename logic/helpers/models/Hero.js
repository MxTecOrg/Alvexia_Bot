const attributes = {
    sta: 10,
    con: 10,
    str: 10,
    agl: 10,
    int: 10,
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
    xp_extra: 0,
    gold_extra: 0
};

const attr_points = {
    points: 0,
    spend: 0
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

const skills = {
    s_1: {
        id: "na",
        type: "na",
        cd: 0
    },
    s_2: {
        id: "na",
        type: "na",
        cd: 0
    },
    s_3: {
        id: "na",
        type: "na",
        cd: 0
    },
    s_4: {
        id: "na",
        type: "na",
        cd: 0
    },
    p_1: {
        id: "na",
        type: "na",
        cd: 0
    },
    p_2: {
        id: "na",
        type: "na",
        cd: 0
    },
};

const inventory = {
    bags: 1,
    armory: [],
    consumables: [],
    materials: []
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
    ban: []
};

const quests = [{
    id: "mq_1",
    current: 0,
    total: 1
}];

const job = {
    job: "na",
    level: 0,
    xp: 0,
    energy: 5,
    recipes: []
}


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
        energy: {
            type: DataTypes.INTEGER,
            defaultValue: 10
        },
        max_energy: {
            type: DataTypes.INTEGER,
            defaultValue: 10
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
            type: DataTypes.STRING,
            defaultValue: JSON.stringify(attr_points)
        },
        hp: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        mp: {
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
        skills: {
            type: DataTypes.STRING,
            defaultValue: JSON.stringify(skills)
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
        },
        job: {
            type: DataTypes.STRING,
            defaultValue: JSON.stringify(job)
        },
        zone: {
            type: DataTypes.STRING,
            defaultValue: "t_0_0"
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: "rest"
        }
    }
}

module.exports = HeroModel;