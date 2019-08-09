'use strict';

var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy'),


    authController = require(path.resolve('./modules/mago/server/controllers/authentication.controller'));



module.exports = function(app) {

    /* ===== Authentication ===== */
    app.route('/api/auth/login')
        .post(authController.authenticate);

    app.route('/api/auth/logingmail')
        .post(authController.logingmail);

    app.route('/api/auth/tokenvalidate/:token')
        .get(authController.renderPasswordForm); //does not require user rights authentication

    app.route('/api/auth/reset/:token')
        .post(authController.resetPassword); //does not require user rights authentication

    app.route('/api/personal-details')
        .all(policy.Authenticate)
        .all(policy.isAllowed)
        .get(authController.get_personal_details)
        .put(authController.update_personal_details);

    app.route('/api/auth/forgot')
        .all(policy.Authenticate)
        .post(authController.forgot);

};