'use strict';

var passport = require('passport'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy'),
    customController = require(path.resolve('./modules/mago/server/controllers/_custom_controller.server.controller'));


module.exports = function(app) {
    /* ===== customer data ===== */
    //app.route('/api/customerdata')
    //    .get(customerData.list);

    //transaction based function to creates customer and login data both at the same time.
    app.route('/api/NewCustomer')
        .all(policy.Authenticate)
        //.all(policy.isAllowed)
        .post(customController.create_customer_with_login);


    app.route('/api/accountslist')
        .all(policy.Authenticate)
        //.all(policy.isAllowed)
        .get(customController.list_logins_with_customer);



    ///third party integration API Routes
    app.route('/api/productslist')
        .all(policy.Authenticate)
        .all(policy.isApiKeyAllowed)
        .get(customController.products_list);


    ///third party integration API Routes
    app.route('/api/createcustomerlogin')
        .all(policy.Authenticate)
        .all(policy.isApiKeyAllowed)
        .post(customController.create_customer_with_login);

    app.route('/api/upsertsubscription')
        .all(policy.Authenticate)
        .all(policy.isApiKeyAllowed)
        .post(customController.insert_or_update_user_subscription);

    app.route('/api/upsertuserandsubscription')
        .all(policy.Authenticate)
        .all(policy.isApiKeyAllowed)
        .post(customController.insert_or_update_user_and_subscription);

};
