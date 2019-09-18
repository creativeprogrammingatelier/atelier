/**
 * Users Routes File 
 * Author: Andrew Heath
 * Date Created: 19/08/19
 */

/**
 * Dependencies 
 */
var express = require('express');
var router = express.Router();
const path = require('path');
var UsersMid = require('../middleware/usersmid');
var Auth = require('../middleware/auth');

router.get('/students', Auth.withAuth, Auth.isTa, (request, result) => {
                UsersMid.getAllStudents((data) => result.status(200).send(data), (error) =>result.status(500).send(error));
        
});

module.exports = router;