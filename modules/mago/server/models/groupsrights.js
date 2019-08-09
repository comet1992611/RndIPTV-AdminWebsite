"use strict";

module.exports = function(sequelize, DataTypes) {
    var Grouprights = sequelize.define('grouprights', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        company_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            defaultValue: 1
        },
        group_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            unique: 'compositeIndex'
        },
        api_group_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            unique: 'compositeIndex'
        },
        allow: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
    }, {
        tableName: 'grouprights',
        associate: function(models) {
            Grouprights.belongsTo(models.api_group, {foreignKey: 'api_group_id'});
            Grouprights.belongsTo(models.groups, {foreignKey: 'group_id'});
            Grouprights.belongsTo(models.settings, {foreignKey: 'company_id'});
        }
    });
    return Grouprights;
};