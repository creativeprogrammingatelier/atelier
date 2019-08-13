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
var withAuth = require('../middleware')
/* GET home page. */
router.get('/', function (request, result, next) {
  result.render('index', {
    title: 'Express'
  });
});

router.get('/api/home', function (request, result) {
  result.send('Welcome!');
});
router.get('/api/secret', withAuth, function (request, result) {
  result.send('The password is potato');
});




module.exports = router;