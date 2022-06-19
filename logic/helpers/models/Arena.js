const ArenaModel = (DataTypes) => {
    return {
        arena_id: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        rating: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        owner: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        members: {
            type: DataTypes.STRING
        }
    };
};

module.exports = ArenaModel;
