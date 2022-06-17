const ConsumablesModel = (DataTypes) => {
    return {
        item_id: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            primaryKey: true
        },
        name: {
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
        isMod: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        modLvl: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        target: {
            type: DataTypes.STRING,
            defaultValue: ""
        },
        formula: {
            type: DataTypes.STRING,
            defaultValue: ""
        },
        pa: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        pe: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        max_pe: {
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
        mp: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        cost: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }
}

module.exports = ConsumablesModel;
