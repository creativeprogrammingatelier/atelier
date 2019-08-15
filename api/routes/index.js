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

router.get('/', function (request, result, next) {
  result.render('index', {
    title: 'Express'
  });
});






module.exports = router;