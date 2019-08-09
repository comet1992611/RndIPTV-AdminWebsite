'use strict'

var passport = require('passport'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    crypto = require('crypto'),
    path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    sequelize_t = require(path.resolve('./config/lib/sequelize')),
    authentication = require(path.resolve('./modules/mago/server/controllers/authentication.controller')),
    redis = require(path.resolve('./config/lib/redis'));

exports.init = function (app) {
    // Use the GoogleStrategy within Passport.
    //   Strategies in Passport require a `verify` function, which accept
    //   credentials (in this case, an accessToken, refreshToken, and Google
    //   profile), and invoke a callback with a user object.
    passport.use(new GoogleStrategy({
            clientID: '[YOUR_clientID]',
            clientSecret: '[YOUR_clientSecret]',
            callbackURL: '/api/auth/google/callback',
            passReqToCallback: true
        },
        function (req, res, accessToken, refreshToken, profile, done) {
            let email = profile.emails[0].value;

            db.groups.findOne({
                attributes: ['id'], where: {code: 'admin'}
            }).then(function(admin_group){
                db.users.findOne({
                    where:{email: email},
                    include: [{model:db.groups, required: true}]
                }).then(function(user){
                    if (!user) {
                        req.body.email = email;
                        done(null, email);
                    }
                    else {
                        req.body.token = authentication.issueJWT(user.id, user.username, user.group.code, user.company_id)
                        done(null, user.username);
                    }
                });
                return null;
            }).catch(function(error){
                done(true);
            });
        }
    ));

    app.get('/api/auth/google', passport.authenticate('google', { scope:['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/plus.profile.emails.read']}));

    app.get('/api/auth/google/callback', passport.authenticate('google', { failureRedirect: '/admin', session: false}),
        function(req, res) {
            if(req.body.token){
                let url = '/admin/#/auth?access_token=' + req.body.token;
                res.redirect(url);
            }
            else{
                res.redirect('/create_company/'+req.body.email);
            }
        })
}

exports.create_company_form = function (req, res) {
    res.render(path.resolve('./modules/users/server/templates/create-company'), { title: 'Create new company', email: req.params.email })
};

exports.create_company_and_user = function (req, res) {

        console.log("The settings length: ", req.app.locals.backendsettings.length)
        var settings_object = {
            mobile_background_url: '',
            mobile_logo_url: '',
            box_logo_url: '',
            box_background_url: '',
            vod_background_url: '',
            assets_url: req.app.locals.backendsettings[1].assets_url,
            old_encryption_key: '0123456789101112',
            new_encryption_key: '0123456789101112',
            key_transition: false,
            email_address: '',
            email_username: '',
            email_password: '',
            company_name: req.body.company_name,
            company_logo: ''
        };
        
        var user_data = {
            username: req.params.email,
            hashedpassword: crypto.randomBytes(4).toString('hex'),
            email: req.params.email,
            telephone: req.body.telephone,
            jwtoken: '',
            isavailable: true,
            third_party_api_token: ''
        };
        var new_company_data;

        return sequelize_t.sequelize.transaction(function (t) {
            return db.settings.create(settings_object, {transaction: t}).then(function (new_company) {
                new_company_data = new_company; //load the data of the new company
                user_data.company_id = new_company.id;
                //prepare objects for default stream sources
                var channel_stream_sources = {company_id: new_company.id, stream_source: 'Live primary source - '+new_company.company_name};
                var vod_stream_sources = {company_id: new_company.id, description: 'VOD primary source - '+new_company.company_name};
                //prepare object for device_menu
                var device_menus = require(path.resolve("./config/defaultvalues/device_menu.json"));
                device_menus.forEach(function(element){delete element.id});
                device_menus.forEach(function(element){element.company_id = new_company.id});
                //prepare object for advanced settings
                var advanced_settings = require(path.resolve("./config/defaultvalues/advanced_settings.json"));
                advanced_settings.forEach(function(element){delete element.id});
                advanced_settings.forEach(function(element){element.company_id = new_company.id});
                //prepare object for email templates
                var email_templates = require(path.resolve("./config/defaultvalues/email_templates.json"));
                email_templates.forEach(function(element){delete element.id});
                email_templates.forEach(function(element){element.company_id = new_company.id});

                return db.channel_stream_source.create(channel_stream_sources, {transaction: t}).then(function (new_company) {
                    return db.vod_stream_source.create(vod_stream_sources, {transaction: t}).then(function(vod_source){
                        return db.device_menu.bulkCreate(device_menus, {transaction: t}).then(function(device_menu){
                            return db.advanced_settings.bulkCreate(advanced_settings, {transaction: t}).then(function(advanced_settings){
                                return db.email_templates.bulkCreate(email_templates, {transaction: t}).then(function(email_templates){
                                    var admin_group = {
                                        company_id: new_company_data.id,
                                        name: req.body.company_name + ' : admin',
                                        code: 'admin',
                                        isavailable: true
                                    };
                                    return db.groups.create(admin_group, {transaction: t}).then(function(admin_data){
                                        user_data.group_id = admin_data.id;
                                        user_data.comnpany_id = new_company_data.id;
                                        return db.users.create(user_data, {transaction: t}).then(function(new_user){
                                            user_data.id = new_user.id;
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        }).then(function (result) {
            req.app.locals.backendsettings[user_data.company_id] = new_company_data;
            redis.client.hmset(new_company_data.id + ':company_settings', new_company_data);
            req.body.token = authentication.issueJWT(user_data.id, user_data.username, 'admin', user_data.company_id)
            res.redirect('/admin/#/auth?access_token=' + req.body.token)
        }).catch(function (error) {
            console.log(error)
            res.redirect('/admin/')
        });
};

