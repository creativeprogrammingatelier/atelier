/**
 * Authentication and User Routes file
 * Author: Andrew Heath 
 * Date created: 13/08/19
 */
var auth = require('../middleware/auth')
var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user')
const secret = 'SECRET';

/**
 * Logout endpoint, JWT can't be destoryed, there are not dession to be closed  
 * @deprecated
 */
// router.get('/logout', function (req, res) {
//   req.logOut();
// });

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
      user.isCorrectPassword(password, (error, same) => {
        if (error) {
          console.log(error)
          result.status(500).json({
            error: 'Internal error please try again'
          });
        } else if (!same) {
          result.status(401).json({
            error: 'Incorrect email or password'
          });
        } else {
          // Issue token to user
          const payload = {
            email
          };
          const token = jwt.sign(payload, secret, {
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
router.get('/checkToken', auth.withAuth, function (req, res) {
  res.sendStatus(200);
});

/**
 * User registration tool 
 */
router.post('/register', (request, result) => {
  const {
    email,
    password,
    role
  } = request.body;
  const user = new User({
    email,
    password,
    role
  });
  user.save((error) => {
    if (error) {
      result.status(500).send('Error registering User');
    } else {
      const payload = {
        email
      };
      const token = jwt.sign(payload, secret, {
        expiresIn: '1h'
      });
      result.status(200).send({
        token: token
      });

    }
  });
});

/**
 * Checks if role of user, (using token) is valid compared to that passed in the body
 * @TODO refactor move functions into middleware
 */
router.post('/checkRole', auth.withAuth, function (request, result) {
  const {
    role
  } = request.body;
  const token =
    request.headers.authorization;
  if (!token) {
    result.status(401).send('Unauthorized: No token provided');
  } else {
    auth.checkRole(result.status(204).send(), (error) => result.status(401).send(error))
  }
});

module.exports = router;