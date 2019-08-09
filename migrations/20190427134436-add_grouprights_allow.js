'use strict';
var winston = require('winston');

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(function (t) {
      return Promise.all([
        queryInterface.addColumn('grouprights', 'allow', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          after: 'api_group_id'
        }, { transaction: t }),
        queryInterface.removeColumn('grouprights', 'read', { transaction: t }),
        queryInterface.removeColumn('grouprights', 'edit', { transsaction: t }),
        queryInterface.removeColumn('grouprights', 'create', { transaction: t })
      ])
      .then(function() {
        return queryInterface.sequelize.query('DELETE FROM grouprights WHERE id>0 OR id=0', {transaction: t}).then(function() {
          return queryInterface.sequelize.query('DELETE FROM api_group WHERE id>0 OR id=0', {transaction: t})
        });
      })
      .catch(function (err) {
        winston.error('Adding column grouprights.allow failed with error message: ', err.message);
      });
    });
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(function(t) {
      return Promise.all([
        queryInterface.removeColumn('grouprights', 'allow', {transaction: t}),
        queryInterface.addColumn('grouprights', 'create', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          after: 'api_group_id'
        }, {transaction: t}),
        queryInterface.addColumn('grouprights', 'edit', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          after: 'api_group_id'
        }, {transaction: t}),
        queryInterface.addColumn('grouprights', 'read', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          after: 'api_group_id'
        }, {transaction: t}),
      ])
        .catch(function (err) {
          winston.error('Dropping column grouprights.allow failed with error message: ', err.message);
        });
    })
  }
};