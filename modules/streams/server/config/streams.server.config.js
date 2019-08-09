'use strict';

var streamtokens = {
    "AKAMAI":  {
        "TOKEN_KEY": "5fa1ea505a8d4247",
        "WINDOW":     9001,
        "SALT": ""
    },

    "FLUSSONIC":  {
        "TOKEN_KEY":  "uGhKNDl54sd123",
        "SALT":       "QKu458HJi",
        "PASSWORD":   "tQZ71bHq",
        "WINDOW":     3600
    },
    "EDGE_CAST": {
        "KEY": "De21Le3tzbRt7T2t8UWI531395987",
        "PROTO_ALLOWED": "http"
    },
    "NIMBLE": {
        "DRM_KEY": "36595F0EF4230DBFDBEA02A0344E7247"
    }
}

/**
 * Module init function.
 */
module.exports = function(app, db) {
    app.locals.streamtokens = streamtokens;
};

