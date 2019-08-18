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

    /**
     * Checks to see whether requset is authenticated correctly
     * @param {*} request 
     * @param {*} result 
     * @param {*} next callback
     */
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
    /**
     * Get the user object corresponding to the request
     * @param {*} request 
     * @param {*} next callback
     */
    getUser: function (request, next) {
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
    }
}