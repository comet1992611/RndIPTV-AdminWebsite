'use strict';

var path = require('path'),
    acl = require('acl'),
    apiGroups = require(path.resolve('./config/defaultvalues/api_group_url.json'));

var jwt = require('jsonwebtoken'),
    jwtSecret = "thisIsMySecretPasscode",
    jwtIssuer = "mago-dev";

var db = require(path.resolve('./config/lib/sequelize')).models;

var async = require('async');
var winston = require('winston');

/**
 * Module dependencies.
 */

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Mago Tables Permissions
 */
exports.invokeRolesPolicies = function() {
    
    let aclList = [];
    let adminAcl = {
        roles: ['admin'],
        allows: [
            {resources: ['/api'], permissions: ['*']}
        ]
    }
    aclList.push(adminAcl);

    db.groups.findAll({
        //empty where get all groups 
    }).then(function(groups) {
        async.forEach(groups, function(group, cb) {
            //admin has access to all routes
            if (group.code == 'admin') {
                cb(null);
                return;
            }

            setGroupRights(group, aclList)
                .then(function(){
                    cb(null);
                }).catch(function(err) {
                    throw err;
                })
        }, function(err) {
            acl.allow(aclList);
        });
    });
};

exports.updateGroupRights = function(groupId) {
    return new Promise(function(resolve, reject) {
        db.groups.findOne({where: {id: groupId}})
        .then(function(group) {
            if (group) {

                acl.removeRole(group.code, function(err){
                    if(err) {
                        resolve(false)
                        return;
                    }

                    let aclList = [];
                    setGroupRights(group, aclList).then(function() {
                        acl.allow(aclList);
                        resolve(true);
                    });
                })
            }
        });
    })
};

function setGroupRights(group, aclList) {
    return new Promise(function(resolve, reject) {
        db.grouprights.findAll({
            where: {group_id: group.id, allow: 1},
            include: [db.api_group]
        }).then(function(permissions) {
            let aclEntry = {};
            aclEntry.roles = [group.code];
            aclEntry.allows = [];

            async.forEach(permissions, function(permission, cb){
                let aclSubEntry = {};
                aclSubEntry.permissions = ['*'];
                let api_urls = apiGroups[permission.api_group.api_group_name];
                if (!api_urls) {
                    throw new Error("Api group urls not found");
                }

                aclSubEntry.resources = api_urls;
                aclEntry.allows.push(aclSubEntry);
                cb(null);
                
            }, function(err){
                aclList.push(aclEntry);
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            })
        })
    })
}

/**
 * Read the user token
 */
exports.Authenticate = function(req, res, next) {
    var aHeader = req.get("Authorization");

    //Check if this request is signed by a valid token
    var token = null;
    if (typeof aHeader != 'undefined')
        token = aHeader;

    try {
        var decoded = jwt.verify(token, jwtSecret);
        req.token = decoded;
        next();
    } catch (err) {
        return res.status(403).json({
            message: 'User is not allowed'
        });
    }
}

/**
 * Check If Policy Allows
 */
exports.isAllowed = function(req, res, next) {
    var roles = (req.token) ? [req.token.role] : ['guest'];
    //check if admin and give direct access to all routes
    if(roles.indexOf('admin') !== -1 || roles.indexOf('superadmin') !== -1) {
        next();
        return;
    }

    let permission = '*';

    let pathName = req.route.path.toLowerCase();
    let colonIndex = pathName.indexOf(':')
    if (colonIndex != -1) {
        pathName = pathName.substring(0, colonIndex);
    }

    acl.areAnyRolesAllowed(roles, pathName, permission, function(err, allowed) {
        if(err) {
            res.status(500).send('Unexpected authorization error');
            return;
        }

        if (allowed) {
            next();
        }
        else {
            res.status(402).send('User is not authorized to access this api')
        }
    })
    
};


// function to verify API KEY for third party integrations.

exports.isApiKeyAllowed = function(req, res, next) {

    let apikey = req.query.apikey;

    db.users.findOne({
        where: {
                jwtoken: apikey,
                isavailable: true
                }
    }).then(function(result) {
        if(result) {
           req.token = result;
           next()
        }
        else {
           return res.status(403).json({
            message: 'API key not authorized'
           });
        }
        return null;
    }).catch(function(err) {
        winston.error(err);
        return res.status(404).json({
            message: 'API key not authorized'
        });
    });
}
