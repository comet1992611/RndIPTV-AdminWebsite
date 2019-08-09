'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    winston = require('winston'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    DBModel = db.groups;

/**
 * Create
 */
exports.create = function(req, res) {
    if(req.token.role !== 'superadmin') req.body.company_id = req.token.company_id; //save record for this company

    DBModel.create(req.body).then(function(result) {
        if (!result) {
            return res.status(400).send({message: 'fail create data'});
        } else {
            return res.jsonp(result);
        }
    }).catch(function(err) {
        winston.error("Creating group failed with error: ", err);
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    });
};

/**
 * Show current
 */
exports.read = function(req, res) {
    if( (req.users.company_id === req.token.company_id) || (req.token.role === 'superadmin') ) res.json(req.users);
    else return res.status(404).send({message: 'No data with that identifier has been found'});
};

/**
 * Update
 */
exports.update = function(req, res) {
    var updateData = req.users;

    if( (req.users.company_id === req.token.company_id) || (req.token.role === 'superadmin') ){
        updateData.updateAttributes(req.body).then(function(result) {
            res.json(result);
        }).catch(function(err) {
            winston.error("Updating group failed with error: ", err);
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        });
    }
    else{
        res.status(404).send({message: 'User not authorized to access these data'});
    }
};

/**
 * Delete
 */
exports.delete = function(req, res) {
    var deleteData = req.users;

    DBModel.findById(deleteData.id).then(function(result) {
        if (result) {
            if ( (result && (result.company_id === req.token.company_id) ) || (req.token.role === 'superadmin') ) {
                result.destroy().then(function() {
                    return res.json(result);
                }).catch(function(err) {
                    winston.error("Deleting group failed with error: ", err);
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                });
            }
            else{
                return res.status(400).send({message: 'Unable to find the Data'});
            }
        } else {
            return res.status(400).send({
                message: 'Unable to find the Data'
            });
        }
    }).catch(function(err) {
        winston.error("Finding group failed with error: ", err);
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    });

};

/**
 * List
 */
exports.list = function(req, res) {

  var query = req.query;
  var offset_start = parseInt(query._start);
  var records_limit = query._end - query._start;

    var where_condition = (req.token.role !== 'superadmin') ? {company_id: req.token.company_id, code: {$notIn: ['superadmin', 'admin']}} : {};

    DBModel.findAndCountAll({
        where: where_condition,
        include: []
    }).then(function(results) {
        if (!results) {
            return res.status(404).send({
                message: 'No data found'
            });
        } else {

      res.setHeader("X-Total-Count", results.count);            
            res.json(results.rows);
        }
    }).catch(function(err) {
        winston.error("Getting group list failed with error: ", err);
        res.jsonp(err);
    });
};

/**
 * middleware
 */
exports.dataByID = function(req, res, next, id) {

    if ((id % 1 === 0) === false) { //check if it's integer
        return res.status(404).send({
            message: 'Data is invalid'
        });
    }

    DBModel.find({
        where: {
            id: id
        },
        include: []
    }).then(function(result) {
        if (!result) {
            return res.status(404).send({
                message: 'No data with that identifier has been found'
            });
        } else {
            req.users = result;
            next();
            return null;
        }
    }).catch(function(err) {
        winston.error("Getting group data failed with error: ", err);
        return next(err);
    });

};
