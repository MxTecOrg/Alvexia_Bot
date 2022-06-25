const PartyModel = (DataTypes) => {
    return {
        party_id: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: "rest"
        },
        owner: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        members: {
            type: DataTypes.STRING,
            defaultValue: "[]"
        },
        zone: {
            type: DataTypes.STRING,
            allowNull: false
        }
    };
};

module.exports = PartyModel;
