var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models;

function check_limit(entity_name, limit) {
    return new Promise(function (limit_reached, reject) {
        db[entity_name].findAndCountAll({attributes: ['id']}).then(function (results) {
            if (results.count >= limit) {
                return limit_reached(true);
            }
            else {
                return limit_reached(false);
            }
        }).catch(function (error) {
            return reject(error);
        });
    });
};

exports.check_limit = check_limit;