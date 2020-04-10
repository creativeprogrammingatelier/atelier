/**
 * Base Routes File
 * Author: Andrew Heath
 * Date Created: 13/08/19
 */
import express from 'express';
import path from 'path';

export const indexRouter = express.Router();

/** Serves default index */
indexRouter.get('/', (_, res) => res.render('index'));

/** Serves the react bundle */
indexRouter.get('*', (_, res) => res.sendFile(path.resolve(__dirname + '../../../../client/index.html')));