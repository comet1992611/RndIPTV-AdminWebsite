"use strict";

module.exports = function(sequelize, DataTypes) {
    var htmlContent = sequelize.define('html_content', {
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
            type: DataTypes.STRING(128),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(256),
            allowNull: false
        },
        content: {
            type: DataTypes.STRING(5000),
            allowNull: false
        },
        url: {
            type: DataTypes.STRING(255),
            allowNull: true
        }
    }, {
        tableName: 'html_content',
        associate: function(models){
            htmlContent.belongsTo(models.settings, {foreignKey: 'company_id'});
        }
    });
    return htmlContent;
};