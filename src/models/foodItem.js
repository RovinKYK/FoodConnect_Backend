const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FoodItem extends Model {
    static associate(models) {
      // Define associations here
      FoodItem.belongsTo(models.User, { foreignKey: 'donor_id', as: 'donor' });
      FoodItem.hasMany(models.FoodRequest, { foreignKey: 'food_item_id', as: 'requests' });
      FoodItem.hasMany(models.Notification, { foreignKey: 'food_item_id', as: 'notifications' });
    }
  }
  
  FoodItem.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    donor_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    food_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    quantity_available: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    quantity_unit: {
      type: DataTypes.ENUM('count', 'grams'),
      allowNull: false
    },
    prepared_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    prepared_time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    image_url: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'FoodItem',
    tableName: 'food_items',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  
  return FoodItem;
}; 