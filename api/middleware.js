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

    // taAuth: function (request, result, next) {
    //     const token =
    //         request.body.token ||
    //         request.query.token ||
    //         request.headers['x-access-token'] ||
    //         request.cookies.token;
    //     if (!token) {
    //         result.status(401).send('Unauthorized: No token provided ta');
    //     } else {
    //         jwt.verify(token, secret, function (err, decoded) {
    //             if (err) {
    //                 result.status(401).send('Unauthorized: Invalid token ta');
    //             } else {
    //                 //    TODO fix this unsafe
    //                 console.log(result)
    //                 if (result.role != "student") {
    //                     next();
    //                 }
    //                 result.status(401).send('Unauthorized: Incorrect role');
    //             }
    //         });
    //     }
    // }
}

// const getUserEmail = function (request, result) {
//     const token =
//         request.body.token ||
//         request.query.token ||
//         request.headers['x-access-token'] ||
//         request.cookies.token;
//     if (!token) {
//         result.status(401).send('Unauthorized: No token provided');
//     } else {
//         jwt.verify(token, secret, function (err, decoded) {
//             if (err) {
//                 result.status(401).send('Unauthorized: Invalid token');
//             } else {
//                 console.log(decoded.email)
//                 return decoded.email;
//             }
//         });
//     }
// }