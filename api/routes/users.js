/**
 * Authentication and User Routes file
 * Author: Andrew Heath 
 * Date created: 13/08/19
 */



var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');

/* Authentication */
router.post('/api/authenticate', (request, result) => {
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
            result.cookie('token', token, {
              httpOnly: true
            }).sendStatus(200);
          }
        })
      }
    }

  );

});


/* Register a user */
router.post('/api/register', (request, result) => {
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
module.exports = router;