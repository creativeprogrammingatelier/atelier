/**
 * Middleware 
 *  Provides management of token, and authentication checks
 * Author: Andrew Heath
 * Created: 13/08/19
 */

import jwt from 'jsonwebtoken';
import UsersMiddleware from './UsersMiddleware';
import User from '../models/user';
/**
 * CHANGE THIS BEFORE DEPLOYEMENT ! 
 */
import Constants from '../lib/constants';
export default class AuthMiddleWare { 
    /**
     * Checks to see whether requset is authenticated correctly
     * @param {*} request 
     * @param {*} result 
     * @param {*} next callback
     */
    static withAuth (request, result, next) {
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
    }
    static isTa (request, result, next) {
        UsersMiddleware.getUser(request, (user) => {
            if (user.role.toLowerCase() == "ta") {
               next();
            } else {
                result.status(401).send();
            }
        },() => result.status(401).send())
    }
    static getAllStudents(onSuccess, onFailure){
        User.find({
            role: "student"
        }, (error, result) => {
            if (!error) {
                onSuccess(result);
            } else {
                onFailure(error);
            }
        })
    }
    static checkRole(request, role, onSuccess, onFailure){
        UsersMiddleware.getUser(request, (user) => {
            if (user.role.toLowerCase() == role.toLowerCase()) {
                onSuccess();
            } else {
                onFailure('Unauthorized: Incorrect role');
            }
        }, onFailure )
    }

}