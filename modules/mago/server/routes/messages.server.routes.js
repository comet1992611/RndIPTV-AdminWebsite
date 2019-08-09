'use strict';

var passport = require('passport'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy'),
    msg = require(path.resolve('./modules/mago/server/controllers/messages.server.controller'));


module.exports = function(app) {

    /* ===== messages ===== */
    app.route('/api/messages')
        .all(policy.Authenticate)
        .get(msg.list)
        .post(msg.create);

    app.route('/api/messages/:messageId')
        .all(policy.Authenticate)
        .get(msg.read)
        .put(msg.update)
        .delete(msg.delete);

    app.route('/api/send-message-action')
        .all(policy.Authenticate)
        .all(policy.isAllowed)
        .post(msg.send_message_action);

    app.route('/api/commands')
        .all(policy.Authenticate)
        .get(msg.list)
        .post(msg.create);

    app.route('/api/commands/:messageId')
        .all(policy.Authenticate)
        .get(msg.read)
        .put(msg.update)
        .delete(msg.delete);

    app.route('/api/send-command-action')
        .all(policy.Authenticate)
        .all(policy.isAllowed)
        .post(msg.send_message_action);


    app.param('messageId', msg.dataByID);

};
