'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('advanced_settings', 'parameter3_value', {type: Sequelize.STRING(100), allowNull: true})
            .catch(function(err) {winston.error('Adding column advanced_settings.parameter3_value failed with error message: ',err.message);});
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('advanced_settings', 'parameter3_value')
            .catch(function(err) {winston.error('Removing column advanced_settings.parameter3_value failed with error message: ',err.message);});
    }
};