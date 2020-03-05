import express from 'express';
import { capture } from '../helpers/ErrorHelper';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { config } from '../helpers/ConfigurationHelper';
import { UserDB } from '../database/UserDB';
import { NotFoundDatabaseError } from '../database/DatabaseErrors';

export const adminRouter = express.Router()

adminRouter.use(AuthMiddleware.requireRole(['admin']));

adminRouter.get('/plugins', capture(async (request, response) => {
    // TODO: this should be database, not config files
    response.send(config.plugins);
}));

adminRouter.post('/plugins', capture(async (request, response) => {
    const name = request.body.name;
    const email = request.body.email;
    const plugin = {
        webhookUrl: request.body.webhookUrl,
        webhookSecret: request.body.webhookSecret,
        publicKey: request.body.publicKey,
        hooks: request.body.hooks
    }
    const user = await UserDB.createUser({
        userName: name,
        email, 
        role: "plugin"
    });
    response.send({
        message: "Add the following plugin object to your configuration file",
        plugin: {
            userID: user.ID,
            ...plugin
        }
    });
}));

adminRouter.delete('/plugins/:userID', capture(async (request, response) => {
    if (config.plugins.some(x => x.userID === request.params.userID)) {
        await UserDB.deleteUser(request.params.userID);
        response.status(200).send({
            message: "The plugin was deleted from the database, you can now remove it from your configuration file"
        });
    } else {
        // TODO: this is not a database, but it will be at some point
        throw new NotFoundDatabaseError();
    }
}));