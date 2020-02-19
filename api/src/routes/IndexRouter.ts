/**
 * Base Routes File 
 * Author: Andrew Heath
 * Date Created: 13/08/19
 */
import express, { Request, Response } from 'express';
import path from 'path';

export const indexRouter = express.Router();

/**
 * Serves default index
 */
indexRouter.get('/', (request: Request, result: Response, next: Function) => {
  result.render('index');
});

/**
 * Serves the react bundle 
 */
indexRouter.get('*', (request: Request, result: Response, next: Function) => {
  result.sendFile(path.resolve(__dirname + '../../../../client/index.html'));
});