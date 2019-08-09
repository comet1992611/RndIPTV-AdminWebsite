'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('settings', 'portrait_background_url', {type: Sequelize.STRING, allowNull: false, defaultValue: '/files/settings/portrait_background.png'})
            .catch(function(err) {winston.error('Adding column settings.portrait_background_url failed with error message: ',err.message);});
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('settings', 'portrait_background_url')
            .catch(function(err) {winston.error('Removing column settings.portrait_background_url failed with error message: ',err.message);});
    }
};