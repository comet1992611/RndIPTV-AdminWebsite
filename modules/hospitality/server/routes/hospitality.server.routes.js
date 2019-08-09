'use strict';
/**
 * Module dependencies.
 */
var path = require('path'),
    config = require(path.resolve('./config/config')),
    hospitalityauthPolicy = require(path.resolve('./modules/hospitality/server/auth/hospitality.server.auth')),
    hospitalityController = require(path.resolve('./modules/hospitality/server/controllers/hospitalitycredentials.server.controller')),
    cache = require('apicache'),
    winston = require(path.resolve('./config/lib/winston'));

module.exports = function(app) {

    //app.use('/apiv2',function (req, res, next) {
    //    winston.info(req.ip.replace('::ffff:', '') + ' # ' + req.originalUrl +' # '+ JSON.stringify(req.body));
        //commented because everything is handled on global security config
        //res.header("Access-Control-Allow-Origin", "*");
    //    next();
    //});


    /* ===== login with mac address ===== */
    app.route('/apiv2/credentials/login_device_mac')
        .all(hospitalityauthPolicy.plainAuth)
        .all(hospitalityauthPolicy.isAccountAllowed)
        .post(hospitalityController.login_device_mac); //verify_device is an improved version of credentailscontroller.login.


};
