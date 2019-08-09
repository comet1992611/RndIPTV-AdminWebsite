'use strict';
var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')),
    response = require(path.resolve("./config/responses.js")),
    crypto = require('crypto'),
    models = db.models;
var async = require("async");
var winston = require('winston');

/**
 * @api {post} /apiv2/credentials/login_device_mac Login using text (room #) and mac as password.
 * @apiVersion 0.1.0
 * @apiName HospitalityDeviceLogin
 * @apiGroup Hospitality
 *
 * @apiParam {String} username It can be room number or mac address.
 * @apiParam {String} password It MUST be mac address.
 * @apiParam {String} boxid Unique device ID.
 * @apiParam {number} appid Application number.
 * @apiParam {String} timestamp Device timestamp
 *
 * @apiDescription This api is used login the device using room number (or other convetion) as username and mac address as password.
 */
exports.login_device_mac = function(req,res) {
    //begin device verification
    models.devices.findOne({
        where: {username: req.auth_obj.username, device_active: true, appid: req.auth_obj.appid}
    }).then(function (device) {
        //if record is found then device is found
        if (device) {
            if (req.auth_obj.boxid == device.device_id) {
                //same user login on same device
                //update value of device_active, since a user is loging into this device
                device.updateAttributes({
                    login_data_id: req.thisuser.id,
                    company_id: req.thisuser.company_id,
                    username: req.auth_obj.username,
                    device_mac_address: decodeURIComponent(req.body.macaddress),
                    appid: req.auth_obj.appid,
                    app_name: (req.body.app_name) ? req.body.app_name : '',
                    app_version: req.body.appversion,
                    ntype: req.body.ntype,
                    device_id: req.auth_obj.boxid,
                    hdmi: (req.body.hdmi == 'true') ? 1 : 0,
                    firmware: decodeURIComponent(req.body.firmwareversion),
                    device_brand: decodeURIComponent(req.body.devicebrand),
                    screen_resolution: decodeURIComponent(req.body.screensize),
                    api_version: decodeURIComponent(req.body.api_version),
                    device_ip: req.ip.replace('::ffff:', ''),
                    os: decodeURIComponent(req.body.os)
                }).then(function (result) {
                    var response_data = [{"encryption_key": req.app.locals.backendsettings[req.thisuser.company_id].new_encryption_key}];
                    response.send_res(req, res, response_data, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'no-store');
                    return null;
                }).catch(function (error) {
                    winston.error("Updating a device's record failed with error: ", error);
                    response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION_2', 'DATABASE_ERROR_DATA', 'no-store');
                });
            }
            else {
                response.send_res(req, res, [], 705, -1, 'DUAL_LOGIN_ATTEMPT_DESCRIPTION', 'DUAL_LOGIN_ATTEMPT_DATA', 'no-store'); //same user try to login on another device
                return null;
            }
        }
        else {
            //fist time login, register on the database
            models.devices.upsert({
                device_active: true,
                login_data_id:		req.thisuser.id,
                company_id:         req.thisuser.company_id,
                username:           req.auth_obj.username,
                device_mac_address: decodeURIComponent(req.body.macaddress),
                appid:              req.auth_obj.appid,
                app_name:           (req.body.app_name) ? req.body.app_name : '',
                app_version:        req.body.appversion,
                ntype:              req.body.ntype,
                device_id:          req.auth_obj.boxid,
                hdmi:               (req.body.hdmi=='true') ? 1 : 0,
                firmware:           decodeURIComponent(req.body.firmwareversion),
                device_brand:       decodeURIComponent(req.body.devicebrand),
                screen_resolution:  decodeURIComponent(req.body.screensize),
                api_version:        decodeURIComponent(req.body.api_version),
                device_ip:          req.ip.replace('::ffff:', ''),
                os:                 decodeURIComponent(req.body.os)
            }).then(function(result){
                var response_data = [{"encryption_key": req.app.locals.backendsettings[req.thisuser.company_id-1].new_encryption_key}];
                response.send_res(req, res, response_data, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'no-store');
                return null;
            }).catch(function(error) {
                winston.error("Creating / updating a device record failed with error: ", error);
                response.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION_3', 'DATABASE_ERROR_DATA', 'no-store');
            });
        }
        return null;
    });
};

