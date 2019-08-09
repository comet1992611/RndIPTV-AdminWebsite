"use strict";

module.exports = function(sequelize, DataTypes) {
    var packagesChannels = sequelize.define('packages_channels', {
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
        channel_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            unique: 'packagechannel'
        },
        package_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            unique: 'packagechannel'
        }
    }, {
        tableName: 'packages_channels',
        associate: function(models) {
            packagesChannels.belongsTo(models.channels, {foreignKey: 'channel_id'});
            packagesChannels.belongsTo(models.package, {foreignKey: 'package_id'});
            packagesChannels.belongsTo(models.settings, {foreignKey: 'company_id'});
        }
    });
    return packagesChannels;
};
