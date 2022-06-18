const MaterialModel = (DataTypes) => {
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
        desc: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }
}

module.exports = MaterialModel;
