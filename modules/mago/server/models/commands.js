"use strict";

module.exports = function(sequelize, DataTypes) {
    var commands = sequelize.define('commands', {
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
        login_data_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        googleappid: {
            type: DataTypes.STRING(255),
            defaultValue: '',
            allowNull: false
        },
        command: {
            type: DataTypes.STRING(45),
            defaultValue: '',
            allowNull: false
        },
        status: {
            type: DataTypes.STRING(10),
            defaultValue: 'sent',
            allowNull: false
        }
    }, {
        tableName: 'commands',
        associate: function(models) {
            if(models.login_data) commands.belongsTo(models.login_data, {foreignKey: 'login_data_id'});
            commands.belongsTo(models.settings, {foreignKey: 'company_id'});
        }

    });
    return commands;
};
