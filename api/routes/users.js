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
 * Logout 
 */
router.get('/logout', function (req, res) {
  req.logOut();
  req.session.destroy(function (err) {
    res.redirect('/'); //Inside a callback… bulletproof!
  });
});

/* Authentication */
router.post('/login', (request, result) => {
  const {
    email,
    password
  } = request.body;
  User.findOne({
    email
  }, (error, user) => {
    if (error) {
      console.log(error);
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

/* Check if token is valid  */
router.get('/checkToken', auth.withAuth, function (req, res) {
  res.sendStatus(200);
});

/* Register a user */
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
      console.log(`User registration error has occured: ${error}`)
      result.status(500).send('Error registering User');
    } else {
      result.status(200).send("User reigstered");
    }
  });
});

router.post('/checkRole', auth.withAuth, function (request, result) {
  const {
    role
  } = request.body;
  const token =
    request.headers.authorization;
  if (!token) {
    result.status(401).send('Unauthorized: No token provided');
  } else {
    jwt.verify(token, secret, function (err, decoded) {
      if (err) {
        result.status(401).send('Unauthorized: Invalid token');
      } else {
        let email = decoded.email;
        User.findOne(({
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
            if (user.role.toLowerCase() == role.toLowerCase()) {
              result.status(204).send()
            } else {
              result.status(401).send('Unauthorized: Incorrect role');
            }
          }
        }))
      }
    })
  }
})


module.exports = router;