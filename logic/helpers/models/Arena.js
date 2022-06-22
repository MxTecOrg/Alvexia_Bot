const ArenaModel = (DataTypes) => {
    return {
        arena_id: {
            type: DataTypes.INTEGER,
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
        entries: {
            type: DataTypes.INTEGER,
            defaultValue: 10
        },
        owner: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        },
        members: {
            type: DataTypes.STRING
        }
    };
};

module.exports = ArenaModel;
