const User = require('../models/user');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const secret = 'SECRET';

/**
 * Files middleware provides helper methods for interacting with comments in the DB
 * @Author Andrew Heath
 */
module.exports = {
    getAllStudents: (onSuccess, onFailure) => {
        User.find({
            role: "student"
        }, -"password",(error, result) => {
            if (!error) {
                onSuccess(result);
            } else {
                onFailure(error);
            }
        })
    },

        /**
     * Get the user object corresponding to the request
     * @param {*} request 
     * @param {*} next callback
     */
    getUser: function (request, onSuccess, onFailure) {
        const token =
            request.headers.authorization;
        jwt.verify(token, secret,  (error, decoded) => {
            if (error) {
                onFailure(error);
            } else {
                let email = decoded.email;
                User.findOne({
                    email
                }, (error, user) => {
                    if (user) {
                        onSuccess(user, request)
                    } else {
                        onFailure(error);
                    }
            }).catch((error) => {
                console.log(e)
                onFailure(error);
            });
            }
        });
    },
}