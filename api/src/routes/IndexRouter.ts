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
  
import {Response} from "express";
/**
 * Serves default index
 */
router.get('/', function (request: Request, result: Response, next: Function) {
  result.render('index');
});

/**
 * Serves the react bundle 
 */
router.get('*', function (request: Request, result: Response, next: Function) {
  result.render('index');
});


module.exports = router;