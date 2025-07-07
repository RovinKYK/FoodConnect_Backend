const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Define associations here
      User.hasMany(models.FoodItem, { foreignKey: 'donor_id', as: 'donatedFoods' });
      User.hasMany(models.FoodRequest, { foreignKey: 'requester_id', as: 'foodRequests' });
      User.hasMany(models.Notification, { foreignKey: 'recipient_user_id', as: 'receivedNotifications' });
      User.hasMany(models.Notification, { foreignKey: 'sender_user_id', as: 'sentNotifications' });
    }
  }
  
  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    choreo_user_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  
  return User;
}; 