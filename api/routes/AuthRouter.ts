/**
 * Authentication and User Routes file
 * Author: Andrew Heath 
 * Date created: 13/08/19
 */


import express from "express";
var router = express.Router();
import jwt from "jsonwebtoken";
import {Constants} from'../lib/constants';
import User from "../models/user";
import AuthMiddleware from "../middleware/AuthMiddleware";
import {Request, Response} from "express";

/* Authentication */
/**
 * Login end point 
 * @TODO refactor method should be pulled out into helper metheods
 */
router.post('/login', (request, result) => {
  const {
    email,
    password
  } = request.body;
  User.findOne({
    email
  }, (error, user) => {
    if (error) {
      result.status(500).json({
        error: 'Internal Error please try again'
      });
    } else if (!user) {
      result.status(401).json({
        error: 'Incorrect email or password'
      })
    } else {
      User.schema.methods.isCorrectPassword(password, (error: Error, correct: boolean) => {
        if (error) {
          console.log(error)
          result.status(500).json({
            error: 'Internal error please try again'
          });
        } else if (!correct) {
          result.status(401).json({
            error: 'Incorrect email or password'
          });
        } else {
          // Issue token to user
          const payload = {email};
          const token = jwt.sign(payload, Constants.AUTHSECRETKEY, {
            expiresIn: '1h'
          });
          result.status(200).send({
            token: token
          });
        }
      })
    }
  });
});

/**
 * Checks if request JWT token passed is valid using withAuth middleware method 
 * */
router.get('/checkToken', AuthMiddleware.withAuth, function (request: Request, response: Response) {
  response.sendStatus(200);
});

/**
 * User registration tool 
 */
// router.post('/register', (request, result) => {
//   const {
//     email,
//     password,
//     role
//   } = request.body;
//   const user = new User({
//     email,
//     password,
//     role
//   });
//   user.save((error) => {
//     if (error) {
//       result.status(500).send('Error registering User');
//     } else {
//       const payload = {
//         email
//       };
//       const token = jwt.sign(payload, Constants.AUTHSECRETKEY, {
//         expiresIn: '1h'
//       });
//       result.status(200).send({
//         token: token
//       });

//     }
//   });
// });

/**
 * Checks if role of user, (using token) is valid compared to that passed in the body
 * @TODO refactor move functions into middleware
 */
router.post('/checkRole', AuthMiddleware.withAuth, function (request, result) {
  const {
    role
  } = request.body;
  AuthMiddleware.checkRole(request, role, () => result.status(204).send(), (error: Error) => result.status(401).send(error))
});

module.exports = router;