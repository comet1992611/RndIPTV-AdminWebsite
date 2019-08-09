'use strict';
var winston = require('winston');

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('settings', 'asset_limitations', {type: Sequelize.STRING, allowNull: false, defaultValue: '{"client_limit":5,"channel_limit":20,"vod_limit":20}'})
        .catch(function(err) {winston.error('Adding column settings.asset_limitations failed with error message: ',err.message);});
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('settings', 'asset_limitations')
        .catch(function(err) {winston.error('Removing column settings.asset_limitations failed with error message: ',err.message);});
  }
};