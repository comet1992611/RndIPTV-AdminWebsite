"use strict";

module.exports = function(sequelize, DataTypes) {
    var vodStreamSource = sequelize.define('vod_stream_source', {
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
        description: {
            type: DataTypes.STRING(32),
            allowNull: false
        }
    }, {
        tableName: 'vod_stream_source',
        associate: function(models) {
            if (models.vod_stream){
                vodStreamSource.hasMany(models.vod_stream, {foreignKey: 'stream_source_id'});
            }
            vodStreamSource.belongsTo(models.settings, {foreignKey: 'company_id'});
        }
    });
    return vodStreamSource;
};
