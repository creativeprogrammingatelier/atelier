/**
 * Authentication and User Routes file
 * Author: Andrew Heath 
 * Date created: 13/08/19
 */
import express, { Request, Response } from 'express';
import AuthMiddleware from '../middleware/AuthMiddleware';
import { issueToken } from '../helpers/AuthenticationHelper';
import { UserDB } from '../database/UserDB';

export const authRouter = express.Router();

/* Authentication */
/**
 * Login end point 
 * @TODO refactor method should be pulled out into helper metheods
 */
authRouter.post('/login', async (request: Request, response: Response) => {
    UserDB.loginUser(
        request.body,
        // Success
        userID => {
            const token = issueToken(userID);
            response.status(200).json({ token });
        },
        // Unauthorized
        () => response.status(401).send(),
        // Error
        err => {
            console.error(err);
            response.status(500).send();
        });
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
authRouter.post('/register', async (request, result) => {
    const user = await UserDB.createUser(request.body);
    const token = issueToken(user.userID!);
    result.status(200).json({ token });
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