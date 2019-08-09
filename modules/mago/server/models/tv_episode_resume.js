"use strict";

module.exports = function(sequelize, DataTypes) {
    var tv_episode_resume = sequelize.define('tv_episode_resume', {
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
        login_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        tv_episode_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        resume_position: { //range should be [0-100]%
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        device_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        updatedAt: {
            type: DataTypes.DATE
        }
    }, {
        tableName: 'tv_episode_resume',
        associate: function(models) {
            if(models.login_data) tv_episode_resume.belongsTo(models.login_data, {foreignKey: 'login_id'});
            if(models.tv_episode) tv_episode_resume.belongsTo(models.tv_episode, {foreignKey: 'tv_episode_id'});
            tv_episode_resume.belongsTo(models.settings, {foreignKey: 'company_id'});
        }
    });
    return tv_episode_resume;
};