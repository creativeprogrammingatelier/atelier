/**
 * Base Routes File 
 * Author: Andrew Heath
 * Date Created: 13/08/19
 */

/**
 * Dependencies 
 */
var express = require('express');
var router = express.Router();
var middleware = require('../middleware')
router.get('/', function (request, result, next) {
  result.render('index', {
    title: 'Express'
  });
});

router.get('/home', function (request, result) {
  result.send('Welcome!');
});





module.exports = router;