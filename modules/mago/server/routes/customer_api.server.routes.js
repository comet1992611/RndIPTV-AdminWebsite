'use strict'

var path = require('path'),
    customerApiHandler = require(path.resolve('modules/mago/server/controllers/customer_api.server.controller.js')),
    policy = require(path.resolve('./modules/mago/server/policies/mago.server.policy.js'));

module.exports = function(app) {
    app.route('/api/3rd/customer')
    .all(policy.isApiKeyAllowed)
    .get(customerApiHandler.listCustomers)
    .post(customerApiHandler.createCustomer);

    app.route('/api/3rd/customer/:username')
        .all(policy.Authenticate)
        .all(policy.isApiKeyAllowed)
        .get(customerApiHandler.getCustomer)
        .put(customerApiHandler.updateCustomer);

    app.route('/api/3rd/subscription')
        .all(policy.Authenticate)
        .all(policy.isApiKeyAllowed)
        .post(customerApiHandler.addSubscription)
        .put(customerApiHandler.cancelSubscription);

    app.route("/api/3rd/customer/subscription/:username")
        .all(policy.isApiKeyAllowed)
        .get(customerApiHandler.getCustomerSubscriptions);
}