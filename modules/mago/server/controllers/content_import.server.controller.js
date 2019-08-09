'use strict'

var csv = require('csvtojson'),
    fs = require('fs-extra'),
    path = require('path'),
    async = require('async'),
    sequelize = require(path.resolve('./config/lib/sequelize')),
    db = sequelize.models,
    parsers = require('playlist-parser');

exports.handleImportChannel = function(req, res) {
    const filename = req.body.filename;

    if (!filename) {
        return res.send({status: false, message: 'mising filename parameter'})
    }

    const ext = path.extname(filename);
    if (ext == '.csv') {
        importChannelFromCSV(req, res);
    }
    else if (ext == '.m3u') {
        importChannelFromM3U(req, res);
    }
    else {
        res.send({status: false, message: 'only csv and m3u formats are supported'})
    }
}

exports.handleImportVod = function(req, res) {
    const filename = req.body.filename;
    let logs = [];

    if (!filename) {
        return res.send({status: false, message: 'missing filename parameter'})
    }
    
    csv()
    .fromFile(path.resolve('./public' + filename))
    .then(function(entries){
        async.forEach(entries, function(entry, callback) {
            sequelize.sequelize.transaction(function(t){
                entry.company_id = req.token.company_id;
                entry.pin_protected = entry.adult_content;
                entry.clicks = 0;
                entry.rate = 0;
                entry.budget = 0;
                entry.revenue = 0;
                entry.isavailable = 1;
                entry.mandatory_ads = 0;
                return db.vod.create(entry, {transaction: t})
                .then(function(vod){
                    let vodStream = {
                        company_id: req.token.company_id,
                        url: entry.stream_url,
                        stream_format: entry.stream_format,
                        vod_id: vod.id,
                        stream_source_id: 1,
                        stream_resolution: '1,2,3,4,5,6',
                        token: 0,
                        token_url: '',
                        encryption: 0,
                        encryption_url: '',
                        drm_platform: 'none'
                    }

                    return db.vod_stream.create(vodStream, {transaction: t});
                })
            }).then(function(res){
                callback();
            }).catch(function(err){
                logs.push('Error creating content ' + entry.title + ' arg: '+ err.message)
                callback()
            });
        }, function(){
            let responseObj = {
                status: true,
                message: 'Content imported successfully'
            }
            if(logs.length) {
                responseObj.status = false;
                responseObj.message = 'Error importing content';
                responseObj.error = logs;
            }
            res.send(responseObj);
        })
    }).catch(function(err){
        res.send({status: false, message: 'Error reading CSV file'})
    });
}

function importChannelFromCSV(req, res) {
    let logs = [];

    csv()
    .fromFile(path.resolve('./public' + req.body.filename))
    .then(function(entries){
        async.forEach(entries, function(entry, callback) {
            entry.genre_id = 1;
            entry.epg_map_id = entry.channel_number;
            entry.company_id = req.token.company_id;
            sequelize.sequelize.transaction(function(t){
                return db.channels.create(entry, {transaction: t})
                .then(function(channel){
                    let channelStream = {
                        company_id: req.token.company_id,
                        stream_url: entry.stream_url,
                        stream_format: entry.stream_format,
                        channel_id: channel.id,
                        stream_source_id: 1,
                        stream_mode: 'live',
                        recording_engine: 'none',
                        stream_resolution: '1,2,3,4,5,6',
                        token: 0,
                        token_url: '',
                        encryption: 0,
                        encryption_url: '',
                        is_octoshape: 0,
                        drm_platform: 'none'
                    }

                    return db.channel_stream.create(channelStream, {transaction: t});
                })
            }).then(function(res){
                callback();
            }).catch(function(err){
                logs.push('Error creating content ' + entry.title + ' arg: ' +  err.message)
                callback()
            });
        }, function(){
            let responseObj = {
                status: true,
                message: 'Content imported successfully'
            }
            if(logs.length > 0) {
                responseObj.status = false;
                responseObj.message = 'Error importing content';
                responseObj.error = logs;
            }
            res.send(responseObj);
        })
    }).catch(function(err){
        res.send({status: false, message: 'Error at CSV file reading'})
    });
}

function importChannelFromM3U(req, res) {
    let m3u = parsers.M3U;
    let streams = m3u.parse(fs.readFileSync('./public' + req.body.filename, {encoding: 'utf8'}));
    let logs = [];

    db.channels.findAll({
        attributes: [[sequelize.sequelize.fn('MAX', sequelize.sequelize.col('channel_number')), 'max']]
    }).then(function(result){
        let chanNum = result[0].dataValues.max;
        async.forEach(streams, function(stream, done) {

            if (!stream) {
                done();
                return;
            }

            chanNum++;
            //decode title params
            let titleParams = stream.title.split(',');
            let options = titleParams[0].split(' ');
            let tvgLogo = getParam(options, 'tvg-logo');

            let channel = {
                company_id: req.token.company_id,
                channel_number: chanNum,
                title: titleParams[titleParams.length - 1], //get lst param as title
                icon_url: (tvgLogo) ? tvgLogo : '',
                genre_id: 1,
                epg_map_id: chanNum,
                description : '',
                pin_protected: 0,
                isavailable: 1,
            };

            sequelize.sequelize.transaction(function(t){
                return db.channels.create(channel, {transaction: t})
                .then(function(channel){
                    let channelStream = {
                        commpany_id: req.token.company_id,
                        stream_url: stream.file,
                        stream_format: 2,
                        channel_id: channel.id,
                        stream_source_id: 1,
                        stream_mode: 'live',
                        recording_engine: 'none',
                        stream_resolution: '1,2,3,4,5,6',
                        token: 0,
                        token_url: '',
                        encryption: 0,
                        encryption_url: '',
                        is_octoshape: 0,
                        drm_platform: 'none'
                    }

                    return db.channel_stream.create(channelStream, {transaction: t});
                })
            }).then(function(res){
                done();
            }).catch(function(err){
                logs.push('Error creating content ' + channel.title + ' arg: ' +  err.message)
                done()
            });

        }, function() {
            let responseObj = {
                status: true,
                message: 'Content imported successfully',
            };

            if (logs.length > 0) {
                responseObj.status = false;
                responseObj.message = 'Error importing content';
                responseObj.error = logs;

            }
            
            res.send(responseObj);
        })
    })

    function getParam(params, param) {
        for(let i = 0;  i < params.length; i++) {
            let kv = params[i].split('=');
            if(kv[0] == param) {
                return kv[1].replace(/"/g, '');
            }
        }

        return null;
    }
}