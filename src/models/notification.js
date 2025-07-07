const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      // Define associations here
      Notification.belongsTo(models.User, { foreignKey: 'recipient_user_id', as: 'recipient' });
      Notification.belongsTo(models.User, { foreignKey: 'sender_user_id', as: 'sender' });
      Notification.belongsTo(models.FoodItem, { foreignKey: 'food_item_id', as: 'foodItem' });
    }
  }
  
  Notification.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    recipient_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    sender_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    food_item_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'food_items',
        key: 'id'
      }
    },
    requested_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Notification',
    tableName: 'notifications',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  
  return Notification;
}; 