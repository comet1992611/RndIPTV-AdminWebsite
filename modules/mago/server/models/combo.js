"use strict";

module.exports = function(sequelize, DataTypes) {
    var Combo = sequelize.define('combo', {
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
        product_id:{
            type: DataTypes.STRING(32),
            allowNull: false,
            unique: true
        },
        name: {
            type: DataTypes.STRING(32),
            allowNull: false
        },
        duration: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        value: {
            type: DataTypes.DOUBLE,
            allowNull: false
        },
        isavailable: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {
        tableName: 'combo',
        associate: function(models) {
            if(models.combo_packages){
                Combo.hasMany(models.combo_packages, {foreignKey: 'combo_id'})
            }
            if(models.salesreport){
                Combo.hasMany(models.salesreport, {foreignKey: 'combo_id'})
            }
            Combo.belongsTo(models.settings, {foreignKey: 'company_id'});
        }
    });
    return Combo;
};
