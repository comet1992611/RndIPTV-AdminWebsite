'use strict';
var passport = require('passport'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy'),
    settings = require(path.resolve('./modules/mago/server/controllers/settings.server.controller'));

module.exports = function(app) {

    /* ===== settings ===== */
    app.route('/api/company_settings')
        .all(policy.Authenticate)
        .all(policy.isAllowed)
        .post(settings.create)
        .get(settings.list);

    app.route('/api/company_settings/:settingId')
        .all(policy.Authenticate)
        .all(policy.isAllowed)
        .get(settings.read)
        .put(settings.update);

    /* ===== settings ===== */
    app.route('/api/settings')
        .all(policy.Authenticate)
        .all(policy.isAllowed)
        .get(settings.list);

    app.route('/api/settings/:settingId')
        .all(policy.Authenticate)
        .all(policy.isAllowed)
        .get(settings.read)
        .put(settings.update);

    /* ===== EmailSettings ===== */
    app.route('/api/EmailSettings')
        .all(policy.Authenticate)
        .all(policy.isAllowed)
        .get(settings.list);

    app.route('/api/EmailSettings/:settingId')
        .all(policy.Authenticate)
        .all(policy.isAllowed)
        .get(settings.read)
        .put(settings.update);

    /* ===== URL ===== */
    app.route('/api/URL')
        .all(policy.Authenticate)
        .all(policy.isAllowed)
        .get(settings.list);

    app.route('/api/URL/:settingId')
        .all(policy.Authenticate)
        .all(policy.isAllowed)
        .get(settings.read)
        .put(settings.update);

    /* ===== ApiKeys ===== */
    app.route('/api/ApiKeys')
        .all(policy.Authenticate)
        .all(policy.isAllowed)
        .get(settings.list);

    app.route('/api/ApiKeys/:settingId')
        .all(policy.Authenticate)
        .all(policy.isAllowed)
        .get(settings.read)
        .put(settings.update);

    /* ===== ImagesSettings ===== */
    app.route('/api/ImagesSettings')
        .all(policy.Authenticate)
        .all(policy.isAllowed)
        .get(settings.list);

    app.route('/api/ImagesSettings/:settingId')
        .all(policy.Authenticate)
        .all(policy.isAllowed)
        .get(settings.read)
        .put(settings.update);

    /* ===== PlayerSettings ===== */
    app.route('/api/PlayerSettings')
        .all(policy.Authenticate)
        .all(policy.isAllowed)
        .get(settings.list);

    app.route('/api/PlayerSettings/:settingId')
        .all(policy.Authenticate)
        .all(policy.isAllowed)
        .get(settings.read)
        .put(settings.update);


    app.param('settingId', settings.dataByID);

    app.route('/api/env_settings')
        .get(settings.env_settings);

};