'use strict';

var CryptoJS = require("crypto-js"),
    crypto = require("crypto"),
    querystring = require("querystring"),
    path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')),
    models = db.models,
    authenticationHandler = require(path.resolve('./modules/deviceapiv2/server/controllers/authentication.server.controller.js')),
    response = require(path.resolve("./config/responses.js"));
var winston = require("winston");

function auth_encrytp(plainText, key) {
    var C = CryptoJS;
    plainText = C.enc.Utf8.parse(plainText);
    key = C.enc.Utf8.parse(key);
    var aes = C.algo.AES.createEncryptor(key, {
        mode: C.mode.CBC,
        padding: C.pad.Pkcs7,
        iv: key
    });
    var encrypted = aes.finalize(plainText);
    return C.enc.Base64.stringify(encrypted);
}

function auth_decrypt(encryptedText, key) {
    var C = CryptoJS;
    //encryptedText = encryptedText.replace(/(\r\n|\n|\r)/gm, "");

    encryptedText = encryptedText.replace(/\\n|\\r|\n|\r/g, "");

    encryptedText = C.enc.Base64.parse(encryptedText);
    key = C.enc.Utf8.parse(key);
    var aes = C.algo.AES.createDecryptor(key, {
        mode: C.mode.CBC,
        padding: C.pad.Pkcs7,
        iv: key
    });
    var decrypted = aes.finalize(encryptedText);

    try {
        return C.enc.Utf8.stringify(decrypted);
    }
    catch(err) {
        return "error";
    }
}

exports.plainAuth = function(req, res, next) {
    req.plaintext_allowed = true;
    next();
}

exports.emptyCredentials = function(req, res, next) {
    req.empty_cred = true;
    next();
}

function missing_params(auth_obj){
    if(auth_obj.username == undefined || auth_obj.password == undefined || auth_obj.appid == undefined || auth_obj.boxid == undefined || auth_obj.timestamp == undefined) return true;
    else return false;
}
function valid_timestamp(auth_obj){
    if((Math.abs(Date.now() - auth_obj.timestamp)) > 120000) return true;
    else return true;
}
function valid_appid(auth_obj){
    if(['1', '2', '3', '4', '5', '6'].indexOf(auth_obj.appid) === -1) return false;
    else return true;
}
//identifies screen size, small screen or big screen
function set_screensize(auth_obj){
    if(['1', '4', '5', '6'].indexOf(auth_obj.appid) === -1) auth_obj.screensize = 2;
    else auth_obj.screensize = 1;
}

function isplaintext(auth, plaintext_allowed){
    var auth_obj = parse_plain_auth(auth);
    if(auth_obj.username && auth_obj.password && auth_obj.appid && auth_obj.boxid && auth_obj.timestamp){
        return true;
    }
    else if(auth_obj.hasOwnProperty('username') && auth_obj.hasOwnProperty('password') && auth_obj.appid && auth_obj.boxid && auth_obj.timestamp && plaintext_allowed){
        return true;
    }
    else{
        return false;
    }
}

function parse_plain_auth(auth){
    var final_auth = {};
    var auth_array = auth.split(";");
    for(var i=0; i<auth_array.length; i++){
        let dl = auth_array[i].indexOf('=');
        let key = auth_array[i].substring(0, dl);
        var value = auth_array[i].substring(dl + 1, auth_array[i].length);
        final_auth[key] = value;
    }
    return final_auth;
}

//verifies account by serching for username=username and password=mac address; used for hospitalities.)
exports.isAccountAllowed = function(req, res, next) {

    if(req.body.auth){  //serach for auth parameter on post data
        var auth = decodeURIComponent(req.body.auth);
    }
    else if(req.headers.auth){ //search for auth paramter in headers
        var auth = decodeURIComponent(req.headers.auth);
        //some ios version was adding extra "{}"
        auth = auth.replace("{","");
        auth = auth.replace("}","");
    }
    else if(req.params.auth) { //search for auth paremter in query parameters
        var auth = decodeURIComponent(req.params.auth);
    }
    else {
        //auth parameter not found
        response.send_res(req, res, [], 888, -1, 'BAD_TOKEN_DESCRIPTION', 'INVALID_TOKEN', 'no-store');
        return;
    }

    //verify and extract auth object
    if(isplaintext(auth, req.plaintext_allowed)){
        //auth object is plain text
        var auth_obj = querystring.parse(auth,";","=");
    }
    else {
        //auth object is encrypted
        var auth_obj = querystring.parse(auth_decrypt(auth,req.app.locals.backendsettings[1].new_encryption_key),";","="); //todo: fix static company_id
        //try old key
        if(missing_params(auth_obj)){
            auth_obj = querystring.parse(auth_decrypt(auth,req.app.locals.backendsettings[1].old_encryption_key),";","="); //todo: fix static company_id
        }
    }

    //if auth_obj is missing any of the five parameters, then token could not be decrypted.
    if(missing_params(auth_obj)){
        response.send_res(req, res, [], 889, -1, 'BAD_TOKEN_DESCRIPTION', 'INVALID_TOKEN', 'no-store');
    }
    else {
        //controls if mobile app is using HDMI
        if((req.body.hdmi === 'true') && (['2', '3'].indexOf(auth_obj.appid) !== -1)){
            response.send_res(req, res, [], 888, -1, 'BAD_TOKEN_DESCRIPTION', 'INVALID_INSTALLATION', 'no-store'); //hdmi cannot be active for mobile devices
        }
        //controls if timestamp is within limits
        else if(valid_timestamp(auth_obj) === false){
            response.send_res(req, res, [], 888, -1, 'BAD_TOKEN_DESCRIPTION', 'INVALID_TIMESTAMP', 'no-store');
        }
        //controls if appid is a valid number
        else if(valid_appid(auth_obj) === true){
            set_screensize(auth_obj);
            if(req.empty_cred){
                req.auth_obj = auth_obj;
                next();
            }
            else{
                //search for username
                models.login_data.findOne({
                    where: {username: auth_obj.username}
                }).then(function (result) {
                    if(result) {
                        if(result.mac_address === auth_obj.password.trim()) {
                            if(result.account_lock) {
                                response.send_res(req, res, [], 703, -1, 'ACCOUNT_LOCK_DESCRIPTION', 'ACCOUNT_LOCK_DATA', 'no-store');
                            }
                            else {
                                req.thisuser = result;
                                req.auth_obj = auth_obj;
                                next();
                                return null; //returns promise
                            }
                        }
                        else {
                            response.send_res(req, res, [], 704, -1, 'WRONG_PASSWORD_DESCRIPTION', 'WRONG_PASSWORD_DATA', 'no-store');
                        }
                    }
                    else {
                        response.send_res(req, res, [], 702, -1, 'USER_NOT_FOUND_DESCRIPTION', 'USER_NOT_FOUND_DATA', 'no-store');
                    }
                }).catch(function(error) {
                    winston.error("Searching for the user account failed with error: ", error);
                    response.send_res(req, res, [], 888, -1, 'BAD_TOKEN_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
                });
            }
        }
        else {
            response.send_res(req, res, [], 888, -1, 'BAD_TOKEN_DESCRIPTION', 'INVALID_APPID', 'no-store');
        }
    }
};
