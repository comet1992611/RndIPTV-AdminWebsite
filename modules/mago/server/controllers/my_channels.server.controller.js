'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  db = require(path.resolve('./config/lib/sequelize')).models,
    winston = require('winston'),
  DBModel = db.my_channels;

/**
 * Create
 */
exports.create = function(req, res) {
  req.body.company_id = req.token.company_id; //save record for this company
  DBModel.create(req.body).then(function(result) {
    if (!result) {
      return res.status(400).send({message: 'fail create data'});
    } else {
      return res.jsonp(result);
    }
  }).catch(function(err) {
    winston.error("Creating client channel failed with error: ", err);
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

/**
 * Show current
 */
exports.read = function(req, res) {
  if(req.myChannels.company_id === req.token.company_id) res.json(req.myChannels);
  else return res.status(404).send({message: 'No data with that identifier has been found'});
};

/**
 * Update
 */
exports.update = function(req, res) {
  var updateData = req.myChannels;

  if(req.myChannels.company_id === req.token.company_id){
    updateData.updateAttributes(req.body).then(function(result) {
      res.json(result);
    }).catch(function(err) {
      winston.error("Updating client channel failed with error: ", err);
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
  var deleteData = req.myChannels;

  DBModel.findById(deleteData.id).then(function(result) {
    if (result) {
      if (result && (result.company_id === req.token.company_id)) {
        result.destroy().then(function() {
          return res.json(result);
        }).catch(function(err) {
          winston.error("Deleting client channel failed with error: ", err);
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
    winston.error("Findig client channel failed with error: ", err);
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });

};

/**
 * List
 */
exports.list = function(req, res) {

  var qwhere = {},
      final_where = {},
      query = req.query;

  if(query.q) {
      qwhere.$or = {};
      qwhere.$or.title = {};
      qwhere.$or.title.$like = '%'+query.q+'%';
      qwhere.$or.description = {};
      qwhere.$or.description.$like = '%'+query.q+'%';
  }

  //start building where
  final_where.where = qwhere;
  if(parseInt(query._start)) final_where.offset = parseInt(query._start);
  if(parseInt(query._end)) final_where.limit = parseInt(query._end)-parseInt(query._start);
  if(query._orderBy) final_where.order = query._orderBy + ' ' + query._orderDir;
  final_where.include = [];

  final_where.where.company_id = req.token.company_id; //return only records for this company

  DBModel.findAndCountAll(

      final_where

  ).then(function(results) {
    if (!results) {
      return res.status(404).send({
        message: 'No data found'
      });
    } else {

      res.setHeader("X-Total-Count", results.count);
      res.json(results.rows);
    }
  }).catch(function(err) {
    winston.error("Getting list of client channels failed with error: ", err);
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
      req.myChannels = result;
      next();
      return null;
    }
  }).catch(function(err) {
    winston.error("Getting client channel failed with error: ", err);
    return next(err);
  });

};
