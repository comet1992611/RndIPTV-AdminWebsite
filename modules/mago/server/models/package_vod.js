"use strict";

module.exports = function(sequelize, DataTypes) {
    var package_vod = sequelize.define('package_vod', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        company_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            defaultValue: 1
        },
        vod_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            unique: 'packagevod'
        },
        package_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            unique: 'packagevod'
        }
    }, {
        tableName: 'package_vod',
        associate: function(models) {
            package_vod.belongsTo(models.package, {foreignKey: 'package_id'});
            package_vod.belongsTo(models.vod, {foreignKey: 'vod_id'});
            package_vod.belongsTo(models.settings, {foreignKey: 'company_id'});
        }
    });
    return package_vod;
};
