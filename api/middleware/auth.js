/**
 * Middleware 
 *  Provides management of token, and authentication checks
 * Author: Andrew Heath
 * Created: 13/08/19
 */

const jwt = require('jsonwebtoken');

/**
 * CHANGE THIS BEFORE DEPLOYEMENT ! 
 */
const secret = 'SECRET';
module.exports = {
    withAuth: function (request, result, next) {
        const token =
            request.body.token ||
            request.query.token ||
            request.headers['x-access-token'] ||
            request.cookies.token;
        if (!token) {
            result.status(401).send('Unauthorized: No token provided');
        } else {
            jwt.verify(token, secret, function (err, decoded) {
                if (err) {
                    result.status(401).send('Unauthorized: Invalid token');
                } else {
                    result.email = decoded.email;
                    next();
                }
            });
        }
    },
    getUser: function (request, next, request) {

        const token =
            request.body.token ||
            request.query.token ||
            request.headers['x-access-token'] ||
            request.cookies.token;
        jwt.verify(token, secret, function (err, decoded) {
            if (err) {
                console.log(error);
                return error;
            } else {
                console.log("non error")
                let email = decoded.email;
                User.findOne({
                    email
                }, (error, user) => {
                    if (user) {
                        next(user, request)
                    } else {
                        console.log(error);
                        throw new Error(error);
                    }
                }).catch((error) => {
                    console.log(error);
                    throw new Error(error);
                });
            }
        });
    }
}