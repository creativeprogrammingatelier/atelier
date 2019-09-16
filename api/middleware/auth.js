/**
 * Middleware 
 *  Provides management of token, and authentication checks
 * Author: Andrew Heath
 * Created: 13/08/19
 */

const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Usermid = require('../middleware/usersmid');
/**
 * CHANGE THIS BEFORE DEPLOYEMENT ! 
 */
const Constants = require('../lib/constants');
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
            jwt.verify(token, Constants.AUTHSECRETKEY, function (err, decoded) {
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
        Usermid.getUser(request, (user) => {
            if (user.role.toLowerCase() == "ta") {
               next();
            } else {
                result.status(401).send();
            }
        },() => result.status(401).send())
    },


    getAllStudents: (onSuccess, onFailure) => {
        User.find({
            role: "student"
        }, (error, result) => {
            if (!error) {
                onSuccess(result);
            } else {
                onFailure(error);
            }
        })
    },
    checkRole: (request, role, onSuccess, onFailure) => {
        Usermid.getUser(request, (user) => {
            if (user.role.toLowerCase() == role.toLowerCase()) {
                onSuccess();
            } else {
                onFailure('Unauthorized: Incorrect role');
            }
        }, onFailure )
    }
       
        
}