// models/Server.js
module.exports = (sequelize, DataTypes) => {
    const Server = sequelize.define('Server', {
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      profilePicture: {
        type: DataTypes.STRING,
        allowNull: false
      },
      filePaths: {
        type: DataTypes.JSON,
        allowNull: true
      }
    });
  
    Server.associate = function(models) {
      Server.belongsToMany(models.User, { through: models.ServerUser, foreignKey: 'serverId' });
    };
  
    return Server;
  };
  