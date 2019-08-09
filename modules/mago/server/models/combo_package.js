"use strict";

module.exports = function(sequelize, DataTypes) {
    var comboPackages = sequelize.define('combo_packages', {
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
        package_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            unique: 'packagecombo'
        },
        combo_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            unique: 'packagecombo'
        }
    }, {
        tableName: 'combo_packages',
        associate: function(models) {
            comboPackages.belongsTo(models.package, {foreignKey: 'package_id'});
            comboPackages.belongsTo(models.combo, {foreignKey: 'combo_id'});
            comboPackages.belongsTo(models.settings, {foreignKey: 'company_id'});
        }
    });
    return comboPackages;
};
