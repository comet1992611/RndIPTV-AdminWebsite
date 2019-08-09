'use strict';
var winston = require('winston');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(function(t){
            return Promise.all([
                //add company_id to the unique key position in table device_menu
                queryInterface.sequelize.query('ALTER TABLE `device_menu` DROP INDEX position;').then(function(success1){
                    queryInterface.sequelize.query('ALTER TABLE `device_menu` ADD CONSTRAINT position UNIQUE (company_id, position);').catch(function(error){winston.error(erro);});
                }).catch(function(error){winston.error(error);}),
                //todo: add company_id to the unique key templateid_language in table email_templates
                queryInterface.sequelize.query('ALTER TABLE `email_templates` DROP INDEX templateid_language;').then(function(success1){
                    queryInterface.sequelize.query('ALTER TABLE `email_templates` ADD CONSTRAINT templateid_language UNIQUE (company_id, template_id, language);').catch(function(err){winston.error(err);});
                }).catch(function(error){winston.error(error);})
                //todo: add company_id to the unique key parameter_id key in table advanced_settings
                //todo: add company_id to the unique key xxxx in table html_content
            ])
        }).catch(function(error){
            winston.error(error);
        });
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(function(t){
            return Promise.all([
                //remove company_id from the unique key position in table device_menu
                queryInterface.sequelize.query('ALTER TABLE `device_menu` DROP FOREIGN KEY device_menu_company_fkey_idx;').then(function(success){
                    queryInterface.sequelize.query('ALTER TABLE `device_menu` DROP INDEX position;').then(function(success){
                        queryInterface.sequelize.query('ALTER TABLE `device_menu` ADD CONSTRAINT position UNIQUE (position);').then(function(success){
                            queryInterface.sequelize.query('ALTER TABLE `device_menu` ADD CONSTRAINT device_menu_company_fkey_idx  FOREIGN KEY (company_id) REFERENCES settings (id);')
                                .catch(function(error){winston.error(error);})
                        }).catch(function(error){winston.error(error);})
                    }).catch(function(error){winston.error(error);})
                }).catch(function(error){winston.error(error);}),
                //remove company_id from the unique key templateid_language in table email_templates
                queryInterface.sequelize.query('ALTER TABLE `email_templates` DROP FOREIGN KEY email_templates_company_fkey_idx;').then(function(success){
                    queryInterface.sequelize.query('ALTER TABLE `email_templates` DROP INDEX templateid_language;').then(function(success){
                        queryInterface.sequelize.query('ALTER TABLE `email_templates` ADD CONSTRAINT templateid_language UNIQUE (template_id, language);').then(function(success){
                            queryInterface.sequelize.query('ALTER TABLE `email_templates` ADD CONSTRAINT email_templates_company_fkey_idx  FOREIGN KEY (company_id) REFERENCES settings (id);')
                                .catch(function(error){winston.error(error);})
                        }).catch(function(error){winston.error(error);})
                    }).catch(function(error){winston.error(error);})
                }).catch(function(error){winston.error(error);})
                //remove company_id from the unique key parameter_id in table advanced_settings
                //remove company_id from the unique key xxxx in table html_content
            ])
        }).catch(function(error){
            winston.error(error);
        });
    }
};