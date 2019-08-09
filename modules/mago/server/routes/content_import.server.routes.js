
var path = require('path'),
    controller = require(path.resolve('modules/mago/server/controllers/content_import.server.controller.js')),
    policy = require(path.resolve('./modules/mago/server/policies/mago.server.policy.js'));


module.exports = function(app) {
    app.route('/api/import_channel')
       .all(policy.Authenticate)
       .all(policy.isAllowed)
       .post(controller.handleImportChannel);

    app.route('/api/import_vod')
        .all(policy.Authenticate)
        .all(policy.isAllowed)
        .post(controller.handleImportVod);
}