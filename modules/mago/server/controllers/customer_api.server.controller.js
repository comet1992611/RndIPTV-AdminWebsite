'use strict'

var path = require('path'),
    db = require(path.resolve('config/lib/sequelize')).models,
    authenticationHandler = require(path.resolve('./modules/deviceapiv2/server/controllers/authentication.server.controller')),
    customerFunctions = require(path.resolve('./custom_functions/customer_functions.js')),
    saleFunctions = require(path.resolve('./custom_functions/sales.js')),
    winston = require(path.resolve('./config/lib/winston'));


exports.listCustomers = function(req, res) {
    db.login_data.findAll({
        attributes: ['id','username','createdAt'],
        include: [
            { model: db.customer_data,
                attributes:['firstname','lastname','email','telephone','address','city','country'],
                required: true}
        ],
        where: {company_id: req.token.company_id},
        limit: 100,
        order: 'id desc',
        raw: true
    }
    ).then(function(results) {
        if (!results) {
            return res.status(404).send({
                error:
                {
                    code: 404,
                    message: 'nothing found'
                }
            });
        } else {
            res.json(results);
        }
    }).catch(function(err) {
        winston.error("Getting list of accounts failed with error: ", err);
        res.send({error: {code: 500, message: 'Internal error'}});
    });
}

/**
 * @api {get} /api/3rd/customer/:username Get Custommer
 * @apiVersion 0.2.0
 * @apiName Get Customer
 * @apiGroup Backoffice
 * @apiHeader {String} authorization Token string acquired from login api.
 * @apiParam {String} username Mandatory parameter.
 * @apiSuccess (200) {json} data: {customer}
 * @apiError (40x) {json} error: 
 * {
 *      code, 
 *      message
 * }
 */
exports.getCustomer = function(req, res) {
    let username = req.params.username
    if (username) {
        db.login_data.find({
            attributes: ['id', 'username', 'createdAt'],
            where: {username: username, company_id: req.token.company_id},
            include: [{
                model: db.customer_data,
                attributes:['firstname','lastname','email','telephone','address','city','country'],
                required: true
            }],
            raw: true
        }).then(function(customer) {
            if (customer) {
                res.send(customer);
            } else {
                res.status(404).send({error: {code: 404, message: 'customer not found'}});
            }
        });
    } 
    else {
        res.status(400).send({error: {code: 400, message: 'username parameter null'}})
    }
}

/**
 * @api {put} /api/3rd/customer Update Customer
 * @apiVersion 0.2.0
 * @apiName Update Customer
 * @apiGroup Backoffice
 * @apiHeader {String} authorization Token string acquired from login api.
 * @apiParam {String} firstname  Optional field firstname.
 * @apiParam {String} lastname  Optional field lastname.
 * @apiParam {String} username  Optional field username.
 * @apiParam {String} password  Optional field password.
 * @apiParam {String} email  Optional field email.
 * @apiParam {String} address  Optional field address.
 * @apiParam {String} city  Optional field city.
 * @apiParam {String} country  Optional field country.
 * @apiParam {String} telephone  Optional field telephone.
 * @apiSuccess (200) {JSON} data: 
 * {
 *      message
 * }
 * @apiError (40x) {JSON} error: 
 * {
 *      code,
 *      message
 * }
 */
exports.updateCustomer = function(req, res) {
    if (req.params.username) {
        db.login_data.update(req.body, {where:{username: req.params.username}})
        .then(function(result) {
            let updatesCounter = 0
            if (result > 0) {
                updatesCounter++;
            }

            db.login_data.findOne({where:{username: req.params.username}})
            .then(function(customer) {
                if (customer) {
                    db.customer_data.update(req.body, {where: {id: customer.customer_id}})
                    .then(function(result) {
                        if (result > 0) {
                            updatesCounter = updatesCounter + 1;
                        } 
                        if (updatesCounter > 0) {
                            res.send({data: {message: 'update executed'}});
                        }
                        else {
                            res.send({data: {message: 'nothing updated'}});
                        }
                    }).catch(function(error) {
                        winston.error('Update customer failed ' + error);
                        res.status(404).send({error: {code: 500, message: 'Internal error'}})
                    })
                } else {
                    res.status(404).send({error: {code: 404, message: 'customer not found'}})
                }
            });

        }).catch(function(error) {
            winston.error(error);
            res.status(500).send({error: {code: 500, message: error}});
        })

    } else {
        res.status(400).send({error: {code: 400, message: 'username parameter null'}})
    }
}

/**
 * @api {post} /api/3rd/customer Create Customer
 * @apiVersion 0.2.0
 * @apiName Create Customer
 * @apiGroup Backoffice
 * @apiHeader {String} authorization Token string acquired from login api.
 * @apiParam {String} firstname  Mandatory field firstname.
 * @apiParam {String} lastname  Mandatory field lastname.
 * @apiParam {String} username  Mandatory field username.
 * @apiParam {String} password  Mandatory field password.
 * @apiParam {String} email  Mandatory field email.
 * @apiParam {String} address  Mandatory field address.
 * @apiParam {String} city  Mandatory field city.
 * @apiParam {String} country  Mandatory field country.
 * @apiParam {String} telephone  Mandatory field telephone.
 * @apiSuccess (200) {JSON} 
 * @apiError (40x) {JSON}
 */
exports.createCustomer = function(req, res) {
    if (!req.body.username || !req.body.email || !req.body.firstname || !req.body.lastname) {
        return res.send({error: {code: 400, message: 'request is missing critical parameters'}});
    }
    req.body.company_id = req.token.company_id; //create customer under this company

    req.body.address = (req.body.address) ? req.body.address : '';
    req.body.city = (req.body.city) ? req.body.city : '';
    req.body.country = req.body.country ? req.body.country : '';
    req.body.telephone = req.body.telephone ? req.body.telephone : '';

    req.body.salt = authenticationHandler.makesalt();
    req.body.channel_stream_source_id = (req.body.channel_stream_source_id) ? req.body.channel_stream_source_id : 1;
    req.body.vod_stream_source = (req.body.vod_stream_source) ? req.body.vod_stream_source : 1;
    req.body.pin = (req.body.pin) ? req.body.pin : 1234;

    db.login_data.findOne({where: {username: req.body.username}}).then(function(customer){
        if (customer) {
            res.send({error: {code: -1, message: 'user exist'}});
        } else {
            customerFunctions.find_or_create_customer_and_login(req, res)
            .then(function(result) {
                if (result.status) {
                    res.send({data: {code: 200, message: 'user created'}})
                } else {
                    res.send({error: {code: 300, message: 'failed to create user'}})
                }
            }).catch(function(error) {
                winston.error('Create customer failed ' + error)
                res.status(500).send({error: {code: 500, message: 'Internal error'}})
            })
        }
    });
}


/**
 * @api {post} /api/3rd/subscription Add subscription
 * @apiVersion 0.2.0
 * @apiName Add Subscription
 * @apiGroup Backoffice
 * @apiHeader {String} authorization Token string acquired from login api.
 * @apiParam {String} username Mandatory parameter.
 * @apiParam {String} product_id Mandatory parameter.
 * @apiParam {String} type Mandatory parameter
 * @apiParam {String} transaction_id Mandatory parameter
 * @apiSuccess (200) {json} data: {subscription}
 * @apiError (40x) {json} error: 
 * {
 *      code, 
 *      message
 * }
 */
exports.addSubscription = function (req, res) {
    if (!req.body.username || !req.body.product_id || !req.body.type || !req.body.transaction_id) {
        return res.send({error: {code: 400, message: 'username or product id or type  or transaction_id parameter null'}});
    }
    
    db.login_data.findOne({ where: {username:  req.body.username}})
        .then(function(customer){
            if (customer) {
                //req.body.username = req.params.username;
                if (req.body.type == 'subscr') {
                    saleFunctions.add_subscription_transaction(req, res, 1, req.body.transaction_id).then(function(result){
                        res.send({data: result});
                    }).catch(function(error) {
                        res.send({error: {code: 500, message: error}});
                    });
                } else if (req.body.type == 'vod') {
                    saleFunctions.buy_movie(req, res, req.body.username, req.body.product_id, req.body.transaction_id).then(function(resul){
                        res.send({data: result});
                    }).catch(function(error) {
                        res.send({error: 500, message: error})
                    });
                }
            }
            else {
                res.send({error: {code: 404, message: 'user not found'}})
            }
        }).catch(function(error) {
            winston.error('Subscription transaction failed ' + error)
            res.send({error: {code: 500, message: 'Internal error'}})
        })
}

/**
 * @api {post} /api/3rd/subscription Cancel subscription
 * @apiName Cancel subscription
 * @apiGroup Backoffice
 * @apiHeader {String} authorization Token string acquired from login api.
 * @apiParam {String} transaction_id Mandatory parameter.
 * @apiSuccess (200) {json} data: 
 * {
 *  
 * }
 * @apiError (40x) {json} error
 * {
 *      code,
 *      message
 * }
 * 
*/
exports.cancelSubscription = function(req, res) {
    if (!req.body.transaction_id) {
        return res.send({error: {code: 400,  message: 'transection_id parameter null'}})
    }

    db.salesreport.findOne({where : {transaction_id: req.body.transaction_id}})
        .then(function(transaction){
            if (!transaction) {
                res.send({error: {code: 404, message: 'transaction does not exist'}})
            }
            else {
                req.body.product_id = transaction.combo_id;
                db.login_data.findOne({where: {id: transaction.login_data_id}})
                    .then(function(user) {
                        if (user) {
                            req.body.username = user.username;
                            saleFunctions.add_subscription_transaction(req, res, -1, req.body.transaction_id).then(function(result){
                                res.send({data: result});
                            });
                        }
                    });
            }
        })
    }
/**
 * @api {post} /api/3rd/customer/subscription/:username Get user subscriptions
 * @apiName Get user subsscriptions
 * @apiGroup Backoffice
 * @apiHeader {String} authorization Token string acquired from login api.
 * @apiParam {String} username Mandatory parameter.
 * @apiSuccess (200) {json} data: 
 * {
 *  
 * }
 * @apiError (40x) {json} error
 * {
 *      code,
 *      message
 * }
 * 
*/
exports.getCustomerSubscriptions = function(req, res) {
    if (!req.params.username) {
        req.send({error: {code: 400, message: 'username parameter missing'}});
        return;
    }

    db.login_data.findOne({where: {username: req.params.username}})
        .then(function(login_data){
            if(!login_data) {
                res.send({error: {code: 404, message: 'User not found'}});
                return
            }

            db.subscription.findAll({
                attributes: ['start_date', 'end_date'],
                where: {login_id: login_data.id},
                include: [
                    {
                        model: db.package,
                        attributes: ['package_name'],
                        required: true
                    }
                ],
                limit: 100,
                order: 'start_date desc',
                raw: true
            }).then(function(results) {
                if(!results) {
                    res.send({error: {code: 404, message: 'No subscrption found'}});
                    return;
                }

                res.json(results);
            }).catch(function(error) {
                winston.error('Getting subscription list failed ' + error);
                res.send({error: {code: 500, message: 'Internal Error'}});
            });
        });
}