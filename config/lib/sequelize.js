"use strict";

var
    path = require('path'),
    config = require(path.resolve('./config/config')),
    Sequelize = require('sequelize'),
    winston = require('./winston'),
    async = require('async'),
    db = {},
    http = require('http'),
    https = require('https'),
    chalk = require('chalk'),
    randomstring = require('randomstring'),
    networking = require(path.resolve('./custom_functions/networking')),
    authentication = require(path.resolve('./modules/deviceapiv2/server/controllers/authentication.server.controller'));

    var salt = randomstring.generate(64);
    var protocol = (config.port === 443) ? 'https://' : 'http://'; //port 443 means we are running https, otherwise we are running http (preferably on port 80)

    const os = require('os');
    const advanced_settings = require(path.resolve("./config/defaultvalues/advanced_settings.json"));
    const email_templates = require(path.resolve("./config/defaultvalues/email_templates.json"));
    const html_content = require(path.resolve("./config/defaultvalues/html_content.json"));
    const api_list = require(path.resolve("./config/api_list.json"));
    const default_device_menu = require(path.resolve("./config/defaultvalues/device_menu.json"));
    const default_activity = require(path.resolve("./config/defaultvalues/activity.json"));
    const default_app_groups = require(path.resolve("./config/defaultvalues/app_groups.json"));
    const default_package_type = require(path.resolve("./config/defaultvalues/package_type.json"));
    const superadmin_group = {name: 'Superadmin', code: 'superadmin', isavailable: 1, company_id: 1};
    const admin_group = {id: 2, name: 'Administrator', code: 'admin', isavailable: 1, company_id: 1};
    const admin_user = {id: 2, username: 'admin', hashedpassword: 'admin', salt: salt, isavailable: 1, group_id: 2, company_id: 1};
    const settings_values = {
        id: 1,
        email_address: 'noreply@demo.com',
        email_username: 'username',
        email_password: 'password',
        assets_url: (networking.external_serverip()) ? protocol+networking.external_serverip() : 'your_server_url',
        old_encryption_key: '0123456789abcdef',
        new_encryption_key: '0123456789abcdef',
        firebase_key: '',
        help_page: '/help_and_support',
        vod_subset_nr: 200,
        activity_timeout: 10800,
        channel_log_time:6,
        log_event_interval:300,
        vodlastchange: Date.now(),
        livetvlastchange: Date.now(),
        menulastchange: Date.now(),
        akamai_token_key: 'akamai_token_key',
        flussonic_token_key: 'flussonic_token_key'
    };

    const complete_menu_object = require(path.resolve("./config/defaultvalues/menu_map.json"));
    const complete_api_group = [];
    const complete_api_url = [];

    db.Sequelize = Sequelize;
    db.models = {};
    db.discover = [];

// Expose the connection function
db.connect = function(database, username, password, options) {

    if (typeof db.logger === 'function') winston.info("Connecting to: " + database + " as: " + username);

    // Instantiate a new sequelize instance
    var sequelize = new db.Sequelize(database, username, password, options);

    db.discover.forEach(function(location) {
        var model = sequelize["import"](location);
        if (model)
            db.models[model.name] = model;
    });

    sequelize.authenticate().then(function(results) {

        // Execute the associate methods for each Model
        Object.keys(db.models).forEach(function(modelName) {
            if (db.models[modelName].options.hasOwnProperty('associate')) {
                db.models[modelName].options.associate(db.models);
            }
        });

        if (config.db.sync) {

            sequelize.sync({force: (process.env.DB_SYNC_FORCE === 'true')})
                .then(function() {
                    async.waterfall([
                        //create settings record
                        function(callback){
                            db.models['settings'].findOrCreate({
                                where: {id:1}, defaults: settings_values
                            }).then(function(settings) {
                                winston.info('Settings created successfully.');
                                callback(null);
                                return null;
                            }).catch(function(err) {
                                winston.error("An error occured: ", err);
                                callback(null);
                            });
                        },
                        //create admin group
                        function(callback){
                            db.models['groups'].findOrCreate({
                                where: {code: 'superadmin'},defaults: superadmin_group
                            }).then(function(group) {
                                winston.info('Super admin group created successfully. Creating user superadmin ...');
                                db.models['groups'].findOne({attributes: ['id'], where: {code: 'superadmin'}}).then(function(superadmin_group){
                                    //create admin user
                                    db.models['users'].findOrCreate({
                                        where: {username: 'superadmin'},
                                        defaults: {username: 'superadmin', hashedpassword: 'admin', salt: salt, isavailable: 1, group_id: superadmin_group.id, company_id: 1}
                                    }).then(function(user) {
                                        winston.info('Superadmin user created successfully.');
                                        callback(null);
                                        return null;
                                    }).catch(function(err) {
                                        winston.error('Error creating superadmin user - ', err);
                                        callback(null);
                                    });
                                    return null;
                                }).catch(function(err){
                                    winston.error('Error searching the id of superadmin group - ', err);
                                    callback(null);
                                });
                                return null;
                            }).catch(function(err) {
                                winston.error('Error creating superadmin group - ', err);
                                callback(null);
                            });
                        },
                        function(callback){
                            db.models['groups'].findOrCreate({
                                where: {code: 'admin'},defaults: admin_group
                            }).then(function(group) {
                                winston.info('Admin group created successfully. Creating user admin ...');
                                //create admin user
                                db.models['users'].findOrCreate({
                                    where: {username: 'admin'}, defaults: admin_user
                                }).then(function(user) {
                                    winston.info('Admin user created successfully.');
                                    callback(null);
                                    return null;
                                }).catch(function(err) {
                                    winston.error('Error creating Admin user - ', err);
                                    callback(null);
                                });
                                return null;
                            }).catch(function(err) {
                                winston.error('Error creating Admin group - ', err);
                                callback(null);
                            });
                        },
                        function(callback){
                            db.models['vod_stream_source'].findOrCreate({
                                where: {id: 1}, defaults: {id:1,description: 'VOD Streams Primary CDN'}
                            }).then(function(done) {
                                winston.info('VOD stream source created successfully.');
                                callback(null);
                                return null;
                            }).catch(function(err) {
                                winston.error('Error creating VOD stream source - ', err);
                                callback(null);
                            });
                        },
                        function(callback){
                            db.models['channel_stream_source'].findOrCreate({
                                where: {id: 1},
                                defaults: {id:1,stream_source: 'Live Streams Primary CDN'}
                            }).then(function(done) {
                                winston.info('Live TV stream source created successfully.');
                                callback(null);
                            }).catch(function(err) {
                                winston.error('Error creating Live TV stream source - ', err);
                                callback(null);
                            });
                        },
                        function(callback){
                            var baseurl = process.env.NODE_HOST || 'localhost' + ":" + config.port;
                            var apiurl = (baseurl == 'localhost:'+config.port) ? protocol+baseurl+'/apiv2/schedule/reload' : baseurl+'/apiv2/schedule/reload'; //api path
                            try {
                                if(config.port === 443){
                                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; //invalid ssl certificate ignored
                                    https.get(apiurl, function(resp){
                                        callback(null);
                                    }).on("error", function(e){
                                        callback(null); //return offset 0 to avoid errors
                                    });
                                }
                                else{
                                    http.get(apiurl, function(resp){
                                        callback(null);
                                    }).on("error", function(e){
                                        callback(null); //return offset 0 to avoid errors
                                    });
                                }
                            } catch(e) {
                                callback(null); //catch error 'Unable to determine domain name' when url is invalid / key+service are invalid
                            }
                        }
                    ],function(err) {
                        if (err) {
                            return next(err);
                        }
                    });
                    winston.info("Database synchronized");
                    return null;
                }).then(function() {
                    //Populating activity table
                    async.forEach(default_activity, function(activity_obj, callback){
                        db.models['activity'].findOrCreate({
                            where: Sequelize.or({id: activity_obj.id}, {description: activity_obj.description}), defaults: activity_obj
                        }).then(function(done) {
                            winston.info('Activity '+activity_obj.description+' created successfuly.');
                            callback(null);
                            return null;
                        }).catch(function(err) {
                            winston.error('Error creating activity '+activity_obj.description+': ',err);
                            return null;
                        });
                    }, function(error){
                        winston.info('Default activities created successfully. Creating App group table ...');
                        return null;
                    });
                    return null;
                }).then(function() {
                    //Populating app_group table
                    async.forEach(default_app_groups, function(app_group_obj, callback){
                        db.models['app_group'].findOrCreate({
                            where: {id: app_group_obj.id}, defaults: app_group_obj
                        }).then(function(done) {
                            callback(null);
                            return null;
                        }).catch(function(err) {
                            winston.error('Error creating app group with id '+app_group_obj.id+': ',err);
                            return null;
                        });
                    }, function(error){
                        winston.info('Default app groups created successfully. Creating package_type table ...');
                        return null;
                    });
                    return null;
                }).then(function() {
                    async.forEach(default_package_type, function(package_type_obj, callback){
                        db.models['package_type'].findOrCreate({
                            where: {id: package_type_obj.id}, defaults: package_type_obj
                        }).then(function(done) {
                            callback(null);
                            return null;
                        }).catch(function(err) {
                            winston.error('Error creating package type '+package_type_obj.description+': ',err);
                            return null;
                        });
                    }, function(error){
                        winston.info('Default package_types created successfully. Creating device menu table ...');
                        return null;
                    });
                    return null;
                }).then(function() {
                    async.forEach(advanced_settings, function(advanced_settings_obj, callback){
                        db.models['advanced_settings'].upsert(
                            advanced_settings_obj
                        ).then(function(done) {
                            callback(null);
                            return null;
                        }).catch(function(err) {
                            winston.error('Error creating configuration '+advanced_settings_obj.parameter_id+': ',err);
                            return null;
                        });
                    }, function(error){
                        winston.info('Default configurations created successfully. Creating device menu table ...');
                        return null;
                    });
                    return null;
                }).then(function() {
                    async.forEach(email_templates, function(email_templates_obj, callback){
                        db.models['email_templates'].findOrCreate({
                            where: {id: email_templates_obj.id}, defaults: email_templates_obj
                        }).then(function(done) {
                            callback(null);
                            return null;
                        }).catch(function(err) {
                            winston.error('Error creating configuration '+email_templates_obj.id+': ',err);
                            return null;
                        });
                    }, function(error){
                        winston.info('Default configurations created successfully. Creating email template table ...');
                        return null;
                    });
                    return null;
                }).then(function() {
                async.forEach(html_content, function(html_content_obj, callback){
                    db.models['html_content'].findOrCreate({
                        where: {id: html_content_obj.id}, defaults: html_content_obj
                    }).then(function(done) {
                        callback(null);
                        return null;
                    }).catch(function(err) {
                        winston.error('Error creating configuration '+html_content_obj.id+': ',err);
                        return null;
                    });
                }, function(error){
                    winston.info('Default configurations created successfully. Creating html content table ...');
                    return null;
                });
                return null;
            }).then(function() {
                    async.forEach(default_device_menu, function(device_menu_obj, callback){
                        db.models['device_menu'].findOrCreate({
                            where: {id: device_menu_obj.id}, defaults: device_menu_obj
                        }).then(function(done) {
                            callback(null);
                            return null;
                        }).catch(function(err) {
                            winston.error('Error creating menu '+device_menu_obj.description+': ',err);
                            return null;
                        });
                    }, function(error){
                        winston.info('Default menus created successfully. Creating device api group table ...');
                        return null;
                    });
                    return null;
                }).then(function() {
                    //prepare the objects for api_url and api_group tables
                    async.forEach(complete_menu_object, function(label, callback){
                        async.forEach(label.menu_list, function(menu_level_one, callback){
                            complete_api_group.push({id: menu_level_one.id, api_group_name: menu_level_one.api_group_name, description: menu_level_one.description});
                            async.forEach(menu_level_one.api_list, function(api_url_obj, callback){
                                complete_api_url.push({api_url: api_url_obj.api_url, description: '????????', api_group_id: menu_level_one.id});
                            }, function(error){
                                winston.info('Default api groups created successfully. Creating device api group table ...');
                                return null;
                            });
                        }, function(error){
                            winston.info('Default api groups created successfully. Creating device api group table ...');
                            return null;
                        });
                    }, function(error){
                        winston.info('Default api groups created successfully. Creating device api group table ...');
                        return null;
                    });
                }).then(function() {
                    //Populating api_group table
                    db.models['api_group'].bulkCreate(
                        complete_api_group, {updateOnDuplicate: ['id']}
                    ).then(function(done) {
                        return null;
                    }).catch(function(err) {
                        winston.error('Error creating api group '+complete_api_group.api_group_name+': ',err);
                        return null;
                    });
                    return null;
                }).then(function() {
                    //Populating api_url table. First all existing urls ought to be deleted, then proceed with the creation.
                    db.models['api_url'].bulkCreate(
                        complete_api_url, {fields: ['api_url', 'description', 'api_group_id'], updateOnDuplicate: ['api_url', 'api_url_obj']}
                    ).then(function(done) {
                        return null;
                    }).catch(function(err) {
                        winston.error('Error creating api url '+complete_api_url.api_url+': ',err);
                        return null;
                    });
                    return null;
                }).then(function() {
                    var schedule = require(path.resolve("./modules/deviceapiv2/server/controllers/schedule.server.controller.js"));
                    schedule.reload_scheduled_programs(); //reloading the scheduled future programs into the event loop
                    return null;
                }).catch(function(err) {
                    winston.error("An error occured: ", err);
                    return null;
                });
        }
        else{
            var schedule = require(path.resolve("./modules/deviceapiv2/server/controllers/schedule.server.controller.js"));
            schedule.reload_scheduled_programs(); //reloading the scheduled future programs into the event loop
        }
        return null;
    }).catch(function(error) {
        winston.error("Error connecting to database - ", error);
    });

    db.sequelize = sequelize;
    winston.info("Finished Connecting to Database");
    return true;
};

module.exports = db;
