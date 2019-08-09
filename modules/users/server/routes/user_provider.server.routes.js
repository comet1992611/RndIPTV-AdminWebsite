'use strict'

var path = require('path'),
    googleAuth = require(path.resolve('./modules/users/server/controllers/google_auth.server.controller'))
module.exports = function(app) {
    googleAuth.init(app);

    app.route('/create_company/:email')
        .get(googleAuth.create_company_form);

    app.route('/create_company_and_user/:email')
        .post(googleAuth.create_company_and_user);
}