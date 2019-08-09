'use strict';
var winston = require("winston");

/**
 * Module dependencies.
 */
var path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    logHandler = require(path.resolve('./modules/mago/server/controllers/logs.server.controller')),
    db = require(path.resolve('./config/lib/sequelize')).models,
    sequelize_t = require(path.resolve('./config/lib/sequelize')),
    DBModel = db.tv_series,
    refresh = require(path.resolve('./modules/mago/server/controllers/common.controller.js')),
    request = require("request"),
    fs = require('fs');
var download = require('download-file');

function link_tv_show_with_genres(tv_show_id,array_category_ids, db_model) {
    var transactions_array = [];
    //todo: references must be updated to non-available, not deleted
    return db_model.update(
        {
            is_available: false
        },
        {
            where: {
                tv_show_id: tv_show_id,
                category_id: {$notIn: array_category_ids}
            }
        }
    ).then(function (result) {
        return sequelize_t.sequelize.transaction(function (t) {
            for (var i = 0; i < array_category_ids.length; i++) {
                transactions_array.push(
                    db_model.upsert({
                        tv_show_id: tv_show_id,
                        category_id: array_category_ids[i],
                        is_available: true
                    }, {transaction: t}).catch(function(error){
                        winston.error(error)
                    })
                )
            }
            return Promise.all(transactions_array, {transaction: t}); //execute transaction
        }).then(function (result) {
            return {status: true, message:'transaction executed correctly'};
        }).catch(function (err) {
            winston.error(err);
            return {status: false, message:'error executing transaction'};
        })
    }).catch(function (err) {
        winston.error(err);
        return {status: false, message:'error deleting existing packages'};
    })
}

function link_tv_show_with_packages(item_id, data_array, model_instance) {
    var transactions_array = [];
    var destroy_where = (data_array.length > 0) ? {
        tv_show_id: item_id,
        package_id: {$notIn: data_array}
    } : {tv_show_id: item_id};

    return model_instance.destroy({
        where: destroy_where
    }).then(function (result) {
        return sequelize_t.sequelize.transaction(function (t) {
            for (var i = 0; i < data_array.length; i++) {
                transactions_array.push(
                    model_instance.upsert({
                        tv_show_id: item_id,
                        package_id: data_array[i],
                        is_available: true
                    }, {transaction: t})
                )
            }
            return Promise.all(transactions_array, {transaction: t}); //execute transaction
        }).then(function (result) {
            return {status: true, message:'transaction executed correctly'};
        }).catch(function (err) {
            winston.error(err);
            return {status: false, message:'error executing transaction'};
        })
    }).catch(function (err) {
        winston.error(err);
        return {status: false, message:'error deleteting existing packages'};
    })
}

/**
 * Create
 */
exports.create = function(req, res) {

    var array_tv_series_categories = req.body.tv_series_categories || [];
    delete req.body.tv_series_categories;

    var array_tv_series_packages = req.body.tv_series_packages || [];
    delete req.body.tv_series_packages;


    if(req.body.icon_url.startsWith("/files/vod/")){
        console.log('success');
    }else{
        var origin_url_icon_url = 'https://image.tmdb.org/t/p/w500'+req.body.icon_url;
        var destination_path_icon_url = "./public/files/vod/";
        var vod_filename_icon_url = req.body.icon_url; //get name of new file
        var options_icon_url = {
            directory: destination_path_icon_url,
            filename: vod_filename_icon_url
        };
        download(origin_url_icon_url, options_icon_url, function(err){
            if (err){
                winston.error("error donwloading? "+err);
            }
            else{
                console.log('sucess');
            }
        });
        // delete req.body.poster_path;
        req.body.icon_url = '/files/vod'+vod_filename_icon_url;
    }

    if(req.body.image_url.startsWith("/files/vod/")){
        console.log('success');
    }else{
        var origin_url_image_url = 'https://image.tmdb.org/t/p/original'+req.body.image_url;
        var destination_path_image_url = "./public/files/vod/";
        var vod_filename_image_url = req.body.image_url; //get name of new file
        var options = {
            directory: destination_path_image_url,
            filename: vod_filename_image_url
        };
        download(origin_url_image_url, options, function(err){
            if (err){
                winston.error("error donwloading? "+err);
            }
            else{
                console.log('sucess');
            }
        });
        // delete req.body.backdrop_path;
        req.body.image_url = '/files/vod'+vod_filename_image_url;
    }



    DBModel.create(req.body).then(function(result) {
        if (!result) {
            return res.status(400).send({message: 'fail create data'});
        } else {
            // logHandler.add_log(req.token.id, req.ip.replace('::ffff:', ''), 'created', JSON.stringify(req.body));
            return link_tv_show_with_genres(result.id,array_tv_series_categories, db.tv_series_categories).then(function(t_result) {
                if (t_result.status) {
                    return link_tv_show_with_packages(result.id, array_tv_series_packages, db.tv_series_packages).then(function(t_result) {
                        if (t_result.status) {
                            return res.jsonp(result);
                        }
                        else {
                            return res.send(t_result);
                        }
                    })
                }
                else {
                    return res.send(t_result);
                }
            })
        }
    }).catch(function(err) {
        winston.error(err);
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    });
};


/**
 * Show current
 */
exports.read = function(req, res) {
    res.json(req.tv_show);
};

/**
 * List
 */

exports.list = function(req, res) {
    var query = req.query;
    var page = query.page || 1;

    if(parseInt(query._start)) page = parseInt(query._start);

    var options = { method: 'GET',
        url: 'https://api.themoviedb.org/3/search/tv',
        qs:
            { page: page,
                query: query.q,
                api_key: 'e76289b7e0306b6e6b6088148b804f01' },
        body: '{}' };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        let res_data = JSON.parse(body);
        // res.setHeader("X-Total-Count", res_data.total_results);
        res.send(res_data.results);
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

    var options = { method: 'GET',
        url: 'https://api.themoviedb.org/3/tv/'+id,
        qs:
            { language: 'en-US',
                api_key: 'e76289b7e0306b6e6b6088148b804f01',
                append_to_response: 'credits,videos'
            },
        body: '{}' };


    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        let res_data = JSON.parse(body);

        // get all starring/cast from tmdb
        var b;
        var starring_array = '';
        for (b = 0; b < res_data.credits.cast.length; b++ ){
            starring_array += res_data.credits.cast[b].name+',';
        }
        //./get all starring/cast from tmdb

        //get director from tmdb
        var c;
        var director_array = '';
        for (c = 0; c < res_data.credits.crew.length; c++ ){

            if (res_data.credits.crew[c].job === 'Executive Producer')
                director_array += res_data.credits.crew[c].name+',';
        }
        //./get director from tmdb

        //get trailer url
        if(res_data.videos.results.length > 0){
            res_data.trailer_url = 'https://www.youtube.com/watch?v='+res_data.videos.results[0].key;
        }else {
            res_data.trailer_url = '';
        }
        //./get trailer url

        //get origin country
        var origin_country = '';
        origin_country += res_data.origin_country;
        //./get origin country


        res_data.origin_country = origin_country;
        res_data.title = res_data.name; delete res_data.name;
        res_data.description = res_data.overview; delete res_data.overview;
        res_data.icon_url = res_data.poster_path; delete res_data.poster_path;
        res_data.image_url = res_data.backdrop_path; delete res_data.backdrop_path;
        res_data.cast = starring_array; delete res_data.credits;
        res_data.director = director_array;



        res.send(res_data);
    });
};



/**
 * @api {post} /api/update_film/ update film
 * @apiVersion 0.2.0
 * @apiName UpdateFilm3rdParty
 * @apiGroup Backoffice
 * @apiHeader {String} authorization Token string acquired from login api.
 * @apiDescription Gets movie information from a third party and updates movie
 * @apiSuccessExample Success-Response:
 *     {
 *       "title": "Pan's Labyrinth",
 *       "imdb_id": "tt0457430",
 *       "description": "In the falangist Spain of 1944, ...",
 *       "year": "2006",
 *       "rate": 8,
 *       "duration": "118",
 *       "director": "Guillermo del Toro",
 *       "starring": "Ivana Baquero, Sergi López, Maribel Verdú, Doug Jones"
 *      }
 * @apiErrorExample Error-Response:
 *     {
 *        "message": "error message"
 *     }
 *     Error value set:
 *     An error occurred while updating this movie // Unexpected error occurred when the movie was being updated with teh new data
 *     Could not find this movie // the search params did not return any movie
 *     An error occurred while searching for this movie // Unexpected error occurred while searching for the movie in our database
 *     An error occurred while trying to get this movie's data // Unexpected error occurred while getting the movie's data from the 3rd party
 *     Unable to parse response // The response from the 3rd party service was of invalid format
 *     Unable to find the movie specified by your keywords // The 3rd party service could not find a match using our keywords
 *
 */
// exports.update_film = function(req, res) {
//     var tv_show_where = {};
//     if(req.body.imdb_id) tv_show_where.imdb_id = req.body.imdb_id;
//     else if(req.body.tv_show_id) tv_show_where.id = req.body.tv_show_id;
//     else {
//         if(req.body.title) tv_show_where.title = req.body.title;
//         if(req.body.year) tv_show_where.year = req.body.year;
//     }
//
//     DBModel.findOne({
//         attributes: ['title', 'imdb_id'], where: tv_show_where
//     }).then(function(tv_show_data){
//         if(tv_show_data){
//             var search_params = {"tv_show_title": tv_show_data.title};
//             if(tv_show_data.imdb_id !== null) search_params.imdb_id = tv_show_data.imdb_id; //only use if it is not null
//             omdbapi(search_params, function(error, response){
//                 if(error){
//                     return res.status(404).send({
//                         message: response
//                     });
//                 }
//                 else{
//                     DBModel.update(
//                         response, {where: tv_show_where}
//                     ).then(function(result){
//                         res.send(response);
//                     }).catch(function(error){
//                         winston.error(error);
//                         return res.status(404).send({
//                             message: "An error occurred while updating this movie"
//                         });
//                     });
//                     return null;
//                 }
//             });
//         }
//         else return res.status(404).send({
//             message: "Could not find this movie"
//         });
//     }).catch(function(error){
//         winston.error(error);
//         return res.status(404).send({
//             message: "An error occurred while searching for this movie"
//         });
//     })
//
//
//
// };
//
// function omdbapi(tv_show_data, callback){
//
//     var api_key = "a421091c"; //todo: dynamic value
//     var search_params = "";
//     if(tv_show_data.imdb_id) search_params = search_params+'&'+'i='+tv_show_data.imdb_id;
//     else{
//         if(tv_show_data.tv_show_title) search_params = search_params+'&'+'t='+tv_show_data.tv_show_title;
//         if(tv_show_data.year) search_params = search_params+'&'+'&y='+tv_show_data.year;
//     }
//
//     if(search_params !== ""){
//         var options = {
//             url: 'http://www.omdbapi.com/?apikey='+api_key+search_params,
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json'
//             }
//         };
//
//         request(options, function (error, response, body) {
//             if(error){
//
//                 callback(true, "An error occurred while trying to get this movie's data");
//             }
//             else try {
//                 var tv_show_data = {
//                     title: JSON.parse(response.body).Title,
//                     imdb_id: JSON.parse(response.body).imdbID,
//                     //category: JSON.parse(response.body).Genre, //todo:get categories list, match them with our list
//                     description: JSON.parse(response.body).Plot,
//                     year: JSON.parse(response.body).Year,
//                     //icon_url: JSON.parse(response.body).Poster, //todo: check if url is valid. donwload + resize image. if successful, pass new filename as param
//                     rate: parseInt(JSON.parse(response.body).imdbRating),
//                     duration: JSON.parse(response.body).Runtime.replace(' min', ''),
//                     director: JSON.parse(response.body).Director,
//                     starring: JSON.parse(response.body).Actors,
//                     //pin_protected: (['R', 'X', 'PG-13'].indexOf(JSON.parse(response.body).Rated) !== -1) ? 1 : 0 //todo: will this rate be taken into consideration?
//                 };
//                 callback(null, tv_show_data);
//             }
//             catch(error){
//                 callback(true, "Unable to parse response");
//             }
//
//         });
//     }
//     else{
//         callback(true, "Unable to find the movie specified by your keywords");
//     }
//
// }