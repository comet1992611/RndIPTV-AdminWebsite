'use strict';
var winston = require('winston'),
    randomstring = require('randomstring');
    
var salt = randomstring.generate(64);

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(function(t){
            return Promise.all([
                queryInterface.sequelize.query('ALTER TABLE `advanced_settings` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `advanced_settings_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `app_management` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `app_management_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `channel_stream` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `channel_stream_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `channel_stream_source` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `channel_stream_source_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `channels` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `channels_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `combo` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `combo_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `combo_packages` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `combo_packages_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `commands` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `commands_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `customer_data` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `customer_data_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `customer_group` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `customer_group_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `device_menu` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `device_menu_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `device_menu_level2` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `device_menu_level2_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `devices` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `devices_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `email_templates` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `email_templates_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `epg_data` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `epg_data_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `favorite_channels` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `favorite_channels_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `genre` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `genre_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `groups` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `groups_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `grouprights` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `grouprights_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `html_content` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `html_content_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `login_data` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `login_data_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `logs` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `logs_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `messages` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `messages_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `my_channels` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `my_channels_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `t_vod_sales` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `t_vod_sales_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `package` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `package_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `packages_channels` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `packages_channels_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `package_vod` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `package_vod_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `payment_transactions` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `payment_transactions_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `program_schedule` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `program_schedule_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `salesreport` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `salesreport_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `subscription` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `subscription_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `t_tv_series_sales` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `t_tv_series_sales_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);;', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `tv_episode` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `tv_episode_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);;', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `tv_episode_resume` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `tv_episode_resume_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);;', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `tv_episode_stream` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `tv_episode_stream_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);;', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `tv_episode_subtitles` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `tv_episode_subtitles_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);;', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `tv_season` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `tv_season_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);;', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `tv_series` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `tv_series_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);;', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `tv_series_packages` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `tv_series_packages_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);;', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `tv_series_categories` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `tv_series_categories_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);;', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `users` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `users_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `vod` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `vod_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `vod_stream_source` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `vod_stream_source_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `vod_category` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `vod_category_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `vod_menu` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `vod_menu_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `vod_menu_carousel` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `vod_menu_carousel_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `vod_resume` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `vod_resume_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `vod_stream` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `vod_stream_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `vod_subtitles` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `vod_subtitles_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t }),
                queryInterface.sequelize.query('ALTER TABLE `vod_vod_categories` ADD `company_id` INTEGER(11) DEFAULT 1 NOT NULL AFTER `id`, ADD CONSTRAINT `vod_vod_categories_company_fkey_idx` FOREIGN KEY (`company_id`) REFERENCES `settings` (`id`);', { transaction: t })
            ])
        }).catch(function(error){
            winston.error('Adding columns company_id from schema failed with error message: ',error);
        });
    },

    down: function(queryInterface, Sequelize){
        return queryInterface.sequelize.transaction(function(t){
            return Promise.all([
                queryInterface.removeColumn('advanced_settings', 'company_id', { transaction: t }),
                queryInterface.removeColumn('app_management', 'company_id', { transaction: t }),
                queryInterface.removeColumn('channel_stream', 'company_id', { transaction: t }),
                queryInterface.removeColumn('channel_stream_source', 'company_id', { transaction: t }),
                queryInterface.removeColumn('channels', 'company_id', { transaction: t }),
                queryInterface.removeColumn('combo', 'company_id', { transaction: t }),
                queryInterface.removeColumn('combo_packages', 'company_id', { transaction: t }),
                queryInterface.removeColumn('commands', 'company_id', { transaction: t }),
                queryInterface.removeColumn('customer_data', 'company_id', { transaction: t }),
                queryInterface.removeColumn('customer_group', 'company_id', { transaction: t }),
                queryInterface.removeColumn('device_menu', 'company_id', { transaction: t }),
                queryInterface.removeColumn('device_menu_level2', 'company_id', { transaction: t }),
                queryInterface.removeColumn('devices', 'company_id', { transaction: t }),
                queryInterface.removeColumn('email_templates', 'company_id', { transaction: t }),
                queryInterface.removeColumn('epg_data', 'company_id', { transaction: t }),
                queryInterface.removeColumn('favorite_channels', 'company_id', { transaction: t }),
                queryInterface.removeColumn('genre', 'company_id', { transaction: t }),
                queryInterface.removeColumn('groups', 'company_id', { transaction: t }),
                queryInterface.removeColumn('grouprights', 'company_id', { transaction: t }),
                queryInterface.removeColumn('html_content', 'company_id', { transaction: t }),
                queryInterface.removeColumn('login_data', 'company_id', { transaction: t }),
                queryInterface.removeColumn('logs', 'company_id', { transaction: t }),
                queryInterface.removeColumn('messages', 'company_id', { transaction: t }),
                queryInterface.removeColumn('my_channels', 'company_id', { transaction: t }),
                queryInterface.removeColumn('t_vod_sales', 'company_id', { transaction: t }),
                queryInterface.removeColumn('package', 'company_id', { transaction: t }),
                queryInterface.removeColumn('packages_channels', 'company_id', { transaction: t }),
                queryInterface.removeColumn('package_vod', 'company_id', { transaction: t }),
                queryInterface.removeColumn('payment_transactions', 'company_id', { transaction: t }),
                queryInterface.removeColumn('program_schedule', 'company_id', { transaction: t }),
                queryInterface.removeColumn('salesreport', 'company_id', { transaction: t }),
                queryInterface.removeColumn('subscription', 'company_id', { transaction: t }),
                queryInterface.removeColumn('t_tv_series_sales', 'company_id', { transaction: t }),
                queryInterface.removeColumn('tv_episode', 'company_id', { transaction: t }),
                queryInterface.removeColumn('tv_episode_resume', 'company_id', { transaction: t }),
                queryInterface.removeColumn('tv_episode_stream', 'company_id', { transaction: t }),
                queryInterface.removeColumn('tv_episode_subtitles', 'company_id', { transaction: t }),
                queryInterface.removeColumn('tv_season', 'company_id', { transaction: t }),
                queryInterface.removeColumn('tv_series', 'company_id', { transaction: t }),
                queryInterface.removeColumn('tv_series_packages', 'company_id', { transaction: t }),
                queryInterface.removeColumn('tv_series_categories', 'company_id', { transaction: t }),
                queryInterface.removeColumn('users', 'company_id', { transaction: t }),
                queryInterface.removeColumn('vod', 'company_id', { transaction: t }),
                queryInterface.removeColumn('vod_stream_source', 'company_id', { transaction: t }),
                queryInterface.removeColumn('vod_category', 'company_id', { transaction: t }),
                queryInterface.removeColumn('vod_menu', 'company_id', { transaction: t }),
                queryInterface.removeColumn('vod_menu_carousel', 'company_id', { transaction: t }),
                queryInterface.removeColumn('vod_resume', 'company_id', { transaction: t }),
                queryInterface.removeColumn('vod_stream', 'company_id', { transaction: t }),
                queryInterface.removeColumn('vod_subtitles', 'company_id', { transaction: t }),
                queryInterface.removeColumn('vod_vod_categories', 'company_id', { transaction: t })
            ])
        }).catch(function(error){
            winston.error('Removing columns company_id from schema failed with error message: ',error.message);
        });
    }
};