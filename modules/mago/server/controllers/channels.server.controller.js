'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    logHandler = require(path.resolve('./modules/mago/server/controllers/logs.server.controller')),
    saas_functions = require(path.resolve('./custom_functions/saas_functions')),
    db = require(path.resolve('./config/lib/sequelize')).models,
    winston = require('winston'),
    refresh = require(path.resolve('./modules/mago/server/controllers/common.controller.js')),
    DBModel = db.channels,
    ChannelPackages = db.packages_channels,
    sequelize_t = require(path.resolve('./config/lib/sequelize')),
    fs = require('fs');



/**
 * custom functions
 */
function link_channel_with_packages(channel_id,array_package_ids) {
    var transactions_array = [];

    return ChannelPackages.destroy({
                where: {
                    channel_id: channel_id,
                    package_id: {$notIn: array_package_ids}
                }
            }).then(function (result) {
                return sequelize_t.sequelize.transaction(function (t) {
                            for (var i = 0; i < array_package_ids.length; i++) {
                                transactions_array.push(
                                      ChannelPackages.upsert({
                                            channel_id: channel_id,
                                            package_id: array_package_ids[i]
                                        }, {transaction: t})
                                )
                            }
                            return Promise.all(transactions_array, {transaction: t}); //execute transaction
                        }).then(function (result) {
                            return {status: true, message:'transaction executed correctly'};
                        }).catch(function (err) {
                            winston.error("Adding channels to packages failed with error: ", err);
                            return {status: false, message:'error executing transaction'};
                        })
            }).catch(function (err) {
                winston.error("Removing channels form packages failed with error: ", err);
                return {status: false, message:'error deleteting existing packages'};
            })
}


/**
 * Create
 */
exports.create = function(req, res) {
    var array_packages_channels = req.body.packages_channels || [];
    delete req.body.packages_channels;

    req.body.company_id = req.token.company_id; //save record for this company

    var limit = req.app.locals.backendsettings[req.token.company_id].asset_limitations.channel_limit; //number of channels that this company can create

    saas_functions.check_limit('channels', limit).then(function(limit_reached){
        if(limit_reached === true) return res.status(400).send({message: "You have reached the limit number of channels you can create for this plan. "});
        else{
            DBModel.create(req.body).then(function(result) {
                if (!result) {
                    return res.status(400).send({message: 'fail create data'});
                }
                else {
                    logHandler.add_log(req.token.id, req.ip.replace('::ffff:', ''), 'created', JSON.stringify(req.body));

                    return link_channel_with_packages(result.id,array_packages_channels).then(function(t_result) {
                        if (t_result.status) {
                            res.jsonp(result);
                        }
                        else {
                            res.send(t_result);
                        }
                    })
                }
            }).catch(function(err) {
                winston.error("Creating channel failed with error: ", err);
                if(err.name === "SequelizeUniqueConstraintError"){
                    if(err.errors[0].path === "channel_number") return res.status(400).send({message: 'Check if this channel number is available'}); //channel number exists
                    else return res.status(400).send({message: err.errors[0].message}); //other duplicate fields. return sequelize error message
                }
                else{
                    return res.status(400).send({message: 'An error occurred while creating this channel. '+err.errors[0].message}); //another error occurred. return sequelize error message
                }
            });
        }
    }).catch(function(error){
        winston.error("Error checking for the limit number of channels for company with id ",req.token.company_id," - ", error);
        return res.status(400).send({message: "The limit number of channels you can create for this plan could not be verified. Check your log file for more information."});
    });
};

/**
 * Show current
 */
exports.read = function(req, res) {
    if(req.channels.company_id === req.token.company_id) res.json(req.channels);
    else return res.status(404).send({message: 'No data with that identifier has been found'});
};

/**
 * @api {put} /api/channels/:channelId Channels - Update channel data
 * @apiVersion 0.2.0
 * @apiName update_channel
 * @apiGroup Backoffice
 * @apiHeader {String} authorization Token string acquired from login api.
 * @apiParam {Number} genre_id  Optional field start_date.
 * @apiParam {String} channel_number  Optional field channel_number.
 * @apiParam {String} title  Optional field title.
 * @apiParam {String} description  Optional field description.
 * @apiParam {String} icon_url  Optional field icon_url.
 * @apiParam {Boolean} pin_protected  Optional field pin_protected.
 * @apiParam {Boolean} isavailable  Optional field isavailable.
 * @apiSuccess (200) {String} message Json of updated record
 * @apiError (40x) {Text} message {
 * "message": informing_message
 * }
 */
exports.update = function(req, res) {
    var updateData = req.channels;
    if(updateData.icon_url != req.body.icon_url) {
        var deletefile = path.resolve('./public'+updateData.icon_url);
    }

    var array_packages_channels = req.body.packages_channels || [];
    delete req.body.packages_channels;

    if(req.channels.company_id === req.token.company_id){
        updateData.updateAttributes(req.body).then(function(result) {
            logHandler.add_log(req.token.id, req.ip.replace('::ffff:', ''), 'created', JSON.stringify(req.body));

            if(deletefile) {
                fs.unlink(deletefile, function (err) {
                    //todo: return some response?
                });
            }

            return link_channel_with_packages(req.body.id,array_packages_channels).then(function(t_result) {
                if (t_result.status) {
                    return res.jsonp(result);
                }
                else {
                    return res.send(t_result);
                }
            })

        }).catch(function(err) {
            winston.error("Update channel data failed with error: ", err);
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
    var deleteData = req.channels;

    DBModel.findById(deleteData.id).then(function(result) {
        if (result) {
            if (result && (result.company_id === req.token.company_id)) {
                result.destroy().then(function() {
                    return res.json(result);
                }).catch(function(err) {
                    winston.error("Deleting channel failed with error: ", err);
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
        return null;
    }).catch(function(err) {
        winston.error("Finding channel failed with error: ", err);
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    });

};

/**
 * @api {get} /api/channels Channels - list
 * @apiVersion 0.2.0
 * @apiName List channels
 * @apiGroup Backoffice
 * @apiHeader {String} authorization Token string acquired from login api.
 * @apiParam {Number} _end  Optional query parameter _end.
 * @apiParam {String} _start  Optional query parameter _start.
 * @apiParam {String} _orderBy  Optional query parameter _orderBy.
 * @apiParam {String} genre_id  Optional query parameter genre_id.
 *
 *  * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *          {
 *              "id": 100,
 *              "genre_id": 1,
 *              "package_id": null,
 *              "channel_number": 200,
 *              "title": "channel title",
 *              "description": "channel description",
 *              "icon_url": "icon url",
 *              "pin_protected": false, // true / false
 *              "isavailable": true, // true / false
 *              "createdAt": null,
 *              "updatedAt": "yyyy-mm-ddThh:mm:ss.000Z",
 *              "genre": {
 *                  "id": 1,
 *                  "description": "genre description",
 *                  "is_available": true, // true / false
 *                  "icon_url": "icon url",
 *                  "createdAt": null,
 *                  "updatedAt": "yyyy-mm-ddThh:mm:ss.000Z"
 *              },
 *              "packages_channels": [
 *                  {
 *                      "package_id": 92
 *                  },....
 *              ]
 *          }...
 *     ]
 */
exports.list = function(req, res) {

  var qwhere = {},
      final_where = {},
      query = req.query;

  if(query.q) {
    qwhere.$or = {};
    qwhere.$or.title = {};
    qwhere.$or.title.$like = '%'+query.q+'%';
    qwhere.$or.channel_number = {};
    qwhere.$or.channel_number.$like = '%'+query.q+'%';
  }

  //start building where
  final_where.where = qwhere;
    if(parseInt(query._end) !== -1){
        if(parseInt(query._start)) final_where.offset = parseInt(query._start);
        if(parseInt(query._end)) final_where.limit = parseInt(query._end)-parseInt(query._start);
    }
  if(query._orderBy) final_where.order = query._orderBy + ' ' + query._orderDir;
  else final_where.order = [['channel_number', 'ASC']];

  if (query.genre_id) qwhere.genre_id = query.genre_id;
    if(query.isavailable === 'true') qwhere.isavailable = true;
    else if(query.isavailable === 'false') qwhere.isavailable = false;

    DBModel.count(final_where).then(function(totalrecord) {

        final_where.include = [{model:db.genre,required:true},{model:db.packages_channels,attributes: ['package_id']}];

        final_where.where.company_id = req.token.company_id; //return only records for this company

        DBModel.findAll(
            final_where
        ).then(function(results) {
            if (!results) {
                return res.status(404).send({
                    message: 'No data found'
                });
            } else {
                res.setHeader("X-Total-Count", totalrecord);
                res.json(results);
            }
        }).catch(function(err) {
            winston.error("Getting channel list failed with error: ", err);
            res.jsonp(err);
        });
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
    include: [{model: db.genre}, {model: db.packages_channels}]
  }).then(function(result) {
    if (!result) {
      return res.status(404).send({
        message: 'No data with that identifier has been found'
      });
    } else {
      req.channels = result;
      next();
      return null;
    }
  }).catch(function(err) {
      winston.error("Finding channel data failed with error: ", err);
    return next(err);
  });

};