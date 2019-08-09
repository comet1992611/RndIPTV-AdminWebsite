'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  db = require(path.resolve('./config/lib/sequelize')).models,
    winston = require('winston'),
  DBModel = db.channel_stream_source;

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
    winston.error("Creating channel stream source failed with error: ", err);
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

/**
 * Show current
 */
exports.read = function(req, res) {
  if(req.channelStreamSource.company_id === req.token.company_id) res.json(req.channelStreamSource);
  else return res.status(404).send({message: 'No data with that identifier has been found'});
};

/**
 * Update
 */
exports.update = function(req, res) {
  var updateData = req.channelStreamSource;

  if(req.channelStreamSource.company_id === req.token.company_id){
    updateData.updateAttributes(req.body).then(function(result) {
      res.json(result);
    }).catch(function(err) {
      winston.error("Updating channel stream source failed with error: ", err);
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
  var deleteData = req.channelStreamSource;

  // Find the article
  DBModel.findById(deleteData.id).then(function(result) {
    if (result) {
      if (result && (result.company_id === req.token.company_id)) {
        // Delete the article
        result.destroy().then(function() {
          return res.json(result);
        }).catch(function(err) {
          winston.error("Deleting the channel stream source failed with error: ", err);
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
    winston.error("Finding the channel stream source failed with error: ", err);
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });

};

/**
 * List
 */
exports.list = function(req, res) {

  DBModel.findAndCountAll({
    where: {company_id: req.token.company_id}
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
    winston.error("Getting list of channel stream sources failed with error: ", err);
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
      req.channelStreamSource = result;
      next();
      return null;
    }
  }).catch(function(err) {
    winston.error("Finding channel stream source failed with error: ", err);
    return next(err);
  });

};
