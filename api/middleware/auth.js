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
    isTa: function (request, result, next) {
        console.log("IS TA IN NOT IMPLEMENTED DANGER")
        next();
    },
    /**
     * Get the user object corresponding to the request
     * @param {*} request 
     * @param {*} next callback
     */
    getUser: function (request, success, failure) {
        const token =
            request.headers.authorization;
        jwt.verify(token, secret, function (error, decoded) {
            if (error) {
                failure(error);
            } else {
                let email = decoded.email;
                User.findOne({
                    email
                }, (error, user) => {
                    if (user) {
                        success(user, request)
                    } else {
                        failure(error);
                    }
                }).catch((error) => {
                    failure(error);
                });
            }
        });
    },

    getAllStudents: (successCallback, failureCallback) => {
        User.find({
            role: "student"
        }, (error, result) => {
            if (!error) {
                successCallback(result);
            } else {
                failureCallback(error);
            }
        })
    },
    checkRole: (successCallback, failureCallback) => {
        jwt.verify(token, secret, function (err, decoded) {
            if (err) {
                failureCallback('Unauthorized: Invalid token')
                result.status(401).send();
            } else {
                let email = decoded.email;
                User.findOne(({
                    email
                }, (error, user) => {
                    if (error) {
                        failureCallback('Internal Error please try again');

                    } else if (!user) {
                        failureCallback('Incorrect email or password');

                    } else {
                        if (user.role.toLowerCase() == role.toLowerCase()) {
                            successCallback();
                        } else {
                            failureCallback('Unauthorized: Incorrect role');
                        }
                    }
                }))
            }
        })
    }
}