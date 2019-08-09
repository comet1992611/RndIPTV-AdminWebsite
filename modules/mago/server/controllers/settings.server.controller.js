'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    dateFormat = require('dateformat'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    logHandler = require(path.resolve('./modules/mago/server/controllers/logs.server.controller')),
    winston = require('winston'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    merge = require('merge'),
    DBModel = db.settings,
    config = require(path.resolve('./config/config')),
    redis = require(path.resolve('./config/lib/redis'));
var sequelize_t = require(path.resolve('./config/lib/sequelize'));
var jwt = require('jsonwebtoken'),
    jwtSecret = "thisIsMySecretPasscode";


/**
 * Show current
 */


exports.read = function(req, res) {
    //for every client company perform a redirect to their setting path, then display their settings. For the mother company, display results
    if(req.token.company_id !== req.settings.id && req.token.role !== 'superadmin'){
        res.redirect(req.path.substr(0, req.path.lastIndexOf("/")+1)+req.token.company_id); //redirects to /settings_api_example_url/company_id
    }
    else {
        res.json(req.settings);
    }
};

exports.env_settings = function(req, res) {

    var company_id = 1;
    if(req.get("Authorization")){
        var aHeader = req.get("Authorization");

        //Check if this request is signed by a valid token
        var token = null;
        if (typeof aHeader != 'undefined') token = aHeader;

        try {
            var decoded = jwt.verify(token, jwtSecret);
            company_id = decoded.company_id;
        } catch (err) {
            company_id = 1;
        }
    }
    var env_settings = {
        "backoffice_version" : config.seanjs.version+' '+config.seanjs.db_migration_nr,
        "company_name": req.app.locals.backendsettings[company_id].company_name,
        "company_logo": req.app.locals.backendsettings[company_id].assets_url+req.app.locals.backendsettings[company_id].company_logo
    };
    res.json(env_settings); //returns version number and other middleware constants
};


/*
* Create
 */
exports.create = function(req, res) {

    req.body.id = req.app.locals.backendsettings[req.app.locals.backendsettings.length-1].id + 1;



    var channel_stream_sources = {company_id: req.body.id, stream_source: 'Live primary source - '+req.body.company_name};
    var vod_stream_sources = {company_id: req.body.id, description: 'VOD primary source - '+req.body.company_name};
    //prepare object for device_menu
    var device_menus = require(path.resolve("./config/defaultvalues/device_menu.json"));
    device_menus.forEach(function(element){delete element.id});
    device_menus.forEach(function(element){element.company_id = req.body.id});
    //prepare object for advanced settings
    var advanced_settings = require(path.resolve("./config/defaultvalues/advanced_settings.json"));
    advanced_settings.forEach(function(element){delete element.id});
    advanced_settings.forEach(function(element){element.company_id = req.body.id});
    //prepare object for email templates
    var email_templates = require(path.resolve("./config/defaultvalues/email_templates.json"));
    email_templates.forEach(function(element){delete element.id});
    email_templates.forEach(function(element){element.company_id = req.body.id});

    req.body.asset_limitations = {
        "client_limit":req.body.asset_limitations.client_limit,
        "channel_limit":req.body.asset_limitations.channel_limit,
        "vod_limit":req.body.asset_limitations.vod_limit
    };

    return sequelize_t.sequelize.transaction(function (t) {
        // chain all your queries here. make sure you return them.
        return db.settings.create(req.body, {transaction: t}).then(function (new_company) {
            if (!new_company)  return res.status(400).send({message: 'fail create data'});
            else {
                req.app.locals.backendsettings.push(new_company);
                return db.channel_stream_source.create(channel_stream_sources, {transaction: t}).then(function (new_company) {
                    return db.vod_stream_source.create(vod_stream_sources, {transaction: t}).then(function(vod_source){
                        return db.device_menu.bulkCreate(device_menus, {transaction: t}).then(function(device_menu){
                            return db.advanced_settings.bulkCreate(advanced_settings, {transaction: t}).then(function(advanced_settings){
                                return db.email_templates.bulkCreate(email_templates, {transaction: t})//.then(function(email_templates){});
                            });
                        });
                    });
                });
            }
        });
    }).then(function (result) {
        return res.jsonp(req.app.locals.backendsettings.length[req.app.locals.backendsettings-1]);
    }).catch(function (err) {
        winston.error("Creating new company failed with error: ", err);
        return res.status(400).send({message: errorHandler.getErrorMessage(err)});
    });
};


/**
 * Update
 */

exports.update = function(req, res) {
    var new_settings = {}; //final values of settings will be stored here
    var new_setting = {}; //temporary timestamps will be stored here

    var updateData = req.settings;

    //for each activity, if the checkbox was checked, store the current timestamp at the temporary object. Otherwise delete it so that it won't be updated
    //LIVE TV
    if(req.body.updatelivetvtimestamp === true){
        delete req.body.livetvlastchange;
        new_setting.livetvlastchange = Date.now();
    }
    else delete req.body.livetvlastchange;
    //MAIN MENU
    if(req.body.updatemenulastchange){
        delete req.body.menulastchange;
        new_setting.menulastchange = Date.now()
    }
    else delete req.body.menulastchange;
    //VOD
    if(req.body.updatevodtimestamp){
        delete req.body.vodlastchange;
        new_setting.vodlastchange = Date.now()
    }
    else delete req.body.vodlastchange;

    new_settings = merge(req.body, new_setting); //merge values left @req.body with values stored @temp object into a new object
    logHandler.add_log(req.token.id, req.ip.replace('::ffff:', ''), 'created', JSON.stringify(new_settings)); //write new values in logs

    req.body.asset_limitations = {
        "client_limit":req.body.asset_limitations.client_limit,
        "channel_limit":req.body.asset_limitations.channel_limit,
        "vod_limit":req.body.asset_limitations.vod_limit
    };

    updateData.updateAttributes(new_settings).then(function(result) {
        //refresh company settings in app memory
        delete req.app.locals.backendsettings[result.id];
        result.already_updated = true;
        req.app.locals.backendsettings[result.id] = result;

        redis.client.hmset(req.token.company_id + ':company_settings', new_settings, function() {
            redis.client.publish('event:company_settings_updated', req.token.company_id)
        });

        return res.json(result);
    }).catch(function(err) {
        winston.error("Updating setting failed with error: ", err);
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    });
};


/**
 * Delete
 */
exports.delete = function(req, res) {
    var deleteData = req.settings;
    DBModel.findById(deleteData.id).then(function(result) {
        if (result) {
            result.destroy().then(function() {
                return res.json(result);
            }).catch(function(err) {
                winston.error("Deleting this setting failed with error: ", err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            });
        } else {
            delete req.app.locals.backendsettings[deleteData.id - 1]; //delete from local app storage this setting
            return res.status(400).send({
                message: 'Unable to find the Data'
            });
        }
    }).catch(function(err) {
        winston.error("Getting setting object failed with error: ", err);
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    });
};

/**
 * List
 */
exports.list = function(req, res) {
    DBModel.findAll({
        include: []
    }).then(function(results) {
        if (!results) {
            return res.status(404).send({
                message: 'No data found'
            });
        } else {
            res.json(results);
        }
    }).catch(function(err) {
        winston.error("Getting setting list failed with error: ", err);
        res.jsonp(err);
    });
};

/**
 * middleware
 */
exports.dataByID = function(req, res, next, id) {

    if ((id % 1 === 0) === false) { //check if it's integer
        return res.status(404).send({
            message: 'Data is invalid'
        });
    }

    DBModel.find({
        where: {
            id: id
        },
        include: []
    }).then(function(result) {
        if (!result) {
            return res.status(404).send({
                message: 'No data with that identifier has been found'
            });
        } else {
            req.settings = result;
            req.app.locals.backendsettings[result.id - 1] = result; //update settings on app when changed from UI
            next();
            return null;
        }
    }).catch(function(err) {
        winston.error("Getting setting data failed with error: ", err);
        return next(err);
    });

};