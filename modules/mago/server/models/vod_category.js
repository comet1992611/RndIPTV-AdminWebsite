"use strict";

module.exports = function(sequelize, DataTypes) {
    var vodCategory = sequelize.define('vod_category', {
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
        name: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(128),
            allowNull: true
        },
        pay: {
            type: DataTypes.STRING(50),
            defaultValue: 0,
            allowNull: true
        },
        password: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        sorting: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        icon_url: {
            type: DataTypes.STRING(256),
            allowNull: true
        },
        small_icon_url: {
            type: DataTypes.STRING(256),
            allowNull: true
        },
        isavailable: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {
        tableName: 'vod_category',
        associate: function(models) {
            if (models.vod_vod_categories){
                vodCategory.hasMany(models.vod_vod_categories, {foreignKey: 'category_id'});
            }
            vodCategory.belongsTo(models.settings, {foreignKey: 'company_id'});
        }
    });
    return vodCategory;
};

