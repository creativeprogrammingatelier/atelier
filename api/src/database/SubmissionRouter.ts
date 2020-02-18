/**
 * Api routes relating to submission information
 *
 * /api/submission/submissionId
 *  - file[] name, type, fileid
 *  - commentThread[] commentThreadId, comment[],
 */

import {Response, Request} from 'express';

let express = require('express');
let router = express.Router();

module.exports = router;