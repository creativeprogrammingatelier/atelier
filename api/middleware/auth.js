/**
 * Middleware 
 *  Provides management of token, and authentication checks
 * Author: Andrew Heath
 * Created: 13/08/19
 */

const jwt = require('jsonwebtoken');
const User = require('../models/user')
/**
 * CHANGE THIS BEFORE DEPLOYEMENT ! 
 */
const secret = 'SECRET';
module.exports = {
    withAuth: function (request, result, next) {
        const token =
            request.headers.authorization;
        if (!token) {
            result.status(401).send('Unauthorized: No token provided');
        } else {
            jwt.verify(token, secret, function (err, decoded) {
                if (err) {
                    console.log(err)
                    result.status(401).send('Unauthorized: Invalid token');
                } else {
                    result.email = decoded.email;
                    next();
                }
            });
        }
    },
    getUser: function (request, next) {
        try {
            const token =
                request.headers.authorization;
            jwt.verify(token, secret, function (error, decoded) {
                if (error) {
                    return error;
                } else {
                    let email = decoded.email;
                    User.findOne({
                        email
                    }, (error, user) => {
                        if (user) {
                            next(user, request)
                        } else {
                            throw new Error(error);
                        }
                    }).catch((error) => {
                        throw new Error(error);
                    });
                }
            });
        } catch (e) {
            //for testing can be removed
            console.log(e)
        }
    }
}