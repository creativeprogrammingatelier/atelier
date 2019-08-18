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
const path = require('path');
router.get('/', function (request, result, next) {
  result.render('index');
});
router.get('*', function (request, result, next) {
  result.sendFile(path.resolve(__dirname + '/../../client/index.html'));
});


module.exports = router;