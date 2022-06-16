const ItemModel = (DataTypes) => {
    return {
        item_id: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        name : {
            type: DataTypes.STRING,
            allowNull: false
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        desc: {
            type: DataTypes.STRING,
            allowNull: false
        },
        level: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        require: {
            type: DataTypes.STRING,
            defaultValue: "{}"
        },
        isMod: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        modLvl: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        sta: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        con: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        str: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        agl: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        int: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        luck: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        hp: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        hp_reg: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        mp: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        mp_reg: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        atk: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        def: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        crit: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        dodge: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        speed: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        xp_extra: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        gold_extra: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        cost : {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }
}

module.exports = ItemModel;
