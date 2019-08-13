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

const withAuth = function (request, result, next) {
    console.log("With auth")
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
}

module.exports = withAuth;