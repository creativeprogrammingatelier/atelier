/**
 * Authentication and User Routes file
 * Author: Andrew Heath 
 * Date created: 13/08/19
 */
import express, { Request, Response } from 'express';
import AuthMiddleware from '../middleware/AuthMiddleware';
import UsersMiddleware from "../middleware/UsersMiddleware";

export const authRouter = express.Router();

/* Authentication */
/**
 * Login end point 
 * @TODO refactor method should be pulled out into helper metheods
 */
authRouter.post('/login', (request: Request, response: Response) => {
  UsersMiddleware.loginUser(request,
    (token: String) => {response.status(200).send({token: token})}, //onSuccess
    () => {response.status(401).send()}, //onUnauthorised 
    (error: Error) => {console.error(error); response.status(500).send()} //onFailure
    );
});

/**
 * Checks if request JWT token passed is valid using withAuth middleware method 
 * */
authRouter.get('/token', AuthMiddleware.withAuth, function (request: Request, response: Response) {
  response.sendStatus(200);
});

/**
 * User registration tool 
 */
authRouter.post('/register', (request, result) => {
  UsersMiddleware.createUser(request,
     (token: String) => result.status(200).send({token: token}),//OnSuccess
     (error: Error) =>  {console.error(error), result.status(500).send('Error creating User')}//OnFailure
  );
});

/**
 * Checks if role of user, (using token) is valid compared to that passed in the body
 * @TODO refactor move functions into middleware
 */
authRouter.post('/role', AuthMiddleware.withAuth, function (request, result) {
  const {
    role
  } = request.body;
  AuthMiddleware.checkRole(request, role, () => result.status(204).send(), (error: Error) => result.status(401).send(error))
});

/**
 * Checks if role of user, (using token) is valid compared to that passed in the body
 * @TODO refactor move functions into middleware
 */
authRouter.post('/roles', AuthMiddleware.withAuth, function (request, result) {
  const {
    roles
  } = request.body;
  AuthMiddleware.checkRoles(request, roles, () => result.status(204).send(), (error: Error) => result.status(401).send(error))
});

/**
 * Checks if role of user, (using token) is valid compared to that passed in the body
 * @TODO refactor move functions into middleware
 */
authRouter.get('/role', AuthMiddleware.withAuth, function (request, result) {
  AuthMiddleware.getRole(request, (role: String) => result.status(200).send({role: role}), (error: Error) => result.status(401).send(error))
});