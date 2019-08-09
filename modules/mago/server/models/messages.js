"use strict";

module.exports = function(sequelize, DataTypes) {
    var message = sequelize.define('messages', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        company_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            defaultValue: 1
        },
        username: {
            type: DataTypes.STRING(32),
            allowNull: false
        },
        googleappid: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        message: {
            type: DataTypes.STRING(128),
            allowNull: false
        },
        action: {
            type: DataTypes.STRING(64),
            allowNull: false
        },
        title: {
            type: DataTypes.STRING(64),
            allowNull: false
        },
    }, {
        tableName: 'messages',
        associate: function(models){
            message.belongsTo(models.settings, {foreignKey: 'company_id'});
        }

    });
    return message;
};
