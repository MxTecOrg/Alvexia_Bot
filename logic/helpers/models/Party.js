const PartyModel = (DataTypes) => {
    return {
        party_id: {
            type: DataTypes.INTEGER,
            unique: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "rest"
        },
        owner: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        members: {
            type: DataTypes.STRING,
            defaultValue: "[]"
        }
    };
};

module.exports = PartyModel;
