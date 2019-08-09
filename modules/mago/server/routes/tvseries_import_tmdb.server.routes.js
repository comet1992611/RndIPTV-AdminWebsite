'use strict';

var passport = require('passport'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy'),
    tmdbtvseries = require(path.resolve('./modules/mago/server/controllers/tvseries_import_tmdb.server.controller'));


module.exports = function(app) {

    /* ===== vods ===== */
    app.route('/api/tmdbseries')
        .get(tmdbtvseries.list);

    app.route('/api/tmdbseries/:tmdbIdd')
    //.all(policy.isAllowed)
        .get(tmdbtvseries.read);
    //.put(tmdbVod.create);

    app.route('/api/tmdbseries/*')
    //.all(policy.isAllowed)
        .put(tmdbtvseries.create);

    app.param('tmdbIdd', tmdbtvseries.dataByID);
};
