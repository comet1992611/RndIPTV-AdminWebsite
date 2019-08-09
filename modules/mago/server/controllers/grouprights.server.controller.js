'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    winston = require('winston'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    policy = require('../policies/mago.server.policy');

/**
 * Create
 */
exports.create = function(req, res) {

    req.body.company_id = req.token.company_id; //save record for this company
    db.grouprights.create(req.body).then(function(result) {
        if (!result) {
            return res.status(400).send({message: 'fail create data'});
        } else {
            return res.jsonp(result);
        }
    }).catch(function(err) {
        winston.error("Creating group right failed with error: ", err);
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    });
};

/**
 * Show current
 */
exports.read = function(req, res) {
    if(req.users.company_id === req.token.company_id || req.token.role === 'superadmin') res.json(req.users);
    else return res.status(404).send({message: 'No data with that identifier has been found'});
};

/**
 * Update
 */
exports.update = function(req, res) {
    //var updateData = req.users;

    req.body.company_id = req.token.company_id;

    db.grouprights.findOne(
        {
            where: {
                group_id: req.body.group_id,
                api_group_id: req.body.api_group_id,
                company_id: req.token.company_id
            }
        }
    ).then(function(result){
        if(result) {
            result.update(req.body)
                .then(function(result) {
                    policy.updateGroupRights(req.body.group_id)
                        .then(function(upd) {
                            res.json({message: 'update success'});
                        })
                });
        }
        else {
            db.grouprights.create(req.body)
                .then(function(result) {
                    policy.updateGroupRights(req.body.group_id)
                        .then(function(upd) {
                            res.json({message: 'Create success'});
                        });
                });
        }
        return null;
        //res.send(result);
    }).catch(function(err) {
        winston.error("Updating group right failed with error: ", err);
        return res.status(404).send({
            message: 'Error'
        });
    });


};

/**
 * Delete
 */
exports.delete = function(req, res) {
    var deleteData = req.users;

    db.grouprights.findById(deleteData.id).then(function(result) {
        if (result) {
            if (result && (result.company_id === req.token.company_id)) {
                result.destroy().then(function() {
                    return res.json(result);
                }).catch(function(err) {
                    winston.error("Deleting group right failed with error: ", err);
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                });
                return null;
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
        winston.error("Finding group right failed with error: ", err);
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    });

};

/**
 * List
 */
exports.list = function(req, res) {

    db.api_group.findAndCountAll({
        attributes: ['id', 'api_group_name', 'description'],
        where: {api_group_name: {$notIn: ['users_and_roles', 'sale_agents']}},
        include: [{model:db.grouprights, where: { group_id: req.query.group_id, company_id: req.token.company_id },required: false, attributes: ['group_id', 'allow']}],
        order: ['api_group.id'],
        raw: true
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
        winston.error("Getting list of group rights failed with error: ", err);
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

    db.grouprights.find({
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
        winston.error("Getting group right failed with error: ", err);
        return next(err);
    });

};