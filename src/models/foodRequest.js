const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FoodRequest extends Model {
    static associate(models) {
      // Define associations here
      FoodRequest.belongsTo(models.User, { foreignKey: 'requester_id', as: 'requester' });
      FoodRequest.belongsTo(models.FoodItem, { foreignKey: 'food_item_id', as: 'foodItem' });
    }
  }
  
  FoodRequest.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    food_item_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'food_items',
        key: 'id'
      }
    },
    requester_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    requested_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    request_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'completed', 'cancelled'),
      defaultValue: 'pending'
    }
  }, {
    sequelize,
    modelName: 'FoodRequest',
    tableName: 'food_requests',
    underscored: true,
    timestamps: true,
    createdAt: 'request_date',
    updatedAt: 'updated_at'
  });
  
  return FoodRequest;
}; 