const bank = {
    gold: 0,
    gems: 0
};

const store = {
    desc: "na",
    items: [],
    consumables: [],
    materials: []
}

const CastleModel = (DataTypes) => {
    return {
        castle_id: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        owner: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        members: {
            type: DataTypes.STRING,
            defaultValue: "{}"
        },
        bank: {
            type: DataTypes.STRING,
            defaultValue: JSON.stringify(bank)
        },
        store: {
            type: DataTypes.STRING,
            defaultValue: JSON.stringify(store)
        },
        isPublic: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        xp: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        level: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        }
    };
};

module.exports = CastleModel;
