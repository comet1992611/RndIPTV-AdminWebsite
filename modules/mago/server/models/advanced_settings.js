"use strict";

module.exports = function(sequelize, DataTypes) {
    var advancedSettings = sequelize.define('advanced_settings', {
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
        parameter_id: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        parameter_value: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        parameter1_value: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        parameter2_value: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        parameter3_value: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        duration: {
            type: DataTypes.INTEGER(50),
            allowNull: true
        },
        description: {
            type: DataTypes.STRING(500),
            allowNull: true
        }
    }, {
        tableName: 'advanced_settings',
        timestamps: false,
        associate: function(models) {
            advancedSettings.belongsTo(models.settings, {foreignKey: 'company_id'});
        }
    });
    return advancedSettings;
};