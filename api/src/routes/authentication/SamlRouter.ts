import express, { Request, Response, NextFunction } from 'express';
import fetch from 'node-fetch';
import { ServiceProvider, IdentityProvider, setSchemaValidator } from 'samlify';
import * as validator from '@authenio/samlify-node-xmllint';
// If the above import complains about missing types, create this file:
//  node_modules/@authenio/samlify-node-xmllint/build/index.d.ts
// with these contents:
//  export declare const validate: (xml: string) => Promise<unknown>;
// Required until https://github.com/authenio/samlify-node-xmllint/pull/1 is merged and published

import { capture } from '../../helpers/ErrorHelper';
import { config, SamlLoginConfiguration } from '../../helpers/ConfigurationHelper';
import { readFileAsString } from '../../helpers/FilesystemHelper';
import { AuthError, setTokenCookie, clearTokenCookie, getCurrentUserID } from '../../helpers/AuthenticationHelper';
import { UserDB } from '../../database/UserDB';
import { NotFoundDatabaseError } from '../../database/DatabaseErrors';

setSchemaValidator(validator);

export async function getSamlRouter(samlConfig: SamlLoginConfiguration) {
    // Construct the SAML IDP from its metadata
    const idp = IdentityProvider({
        metadata:
            "url" in samlConfig.metadata 
            ? await fetch(samlConfig.metadata.url).then(res => res.text())
            : await readFileAsString(samlConfig.metadata.file)
    });

    // Create the SAML SP metadata for our application
    const urlBase = `${config.baseUrl}/api/auth/${samlConfig.id}`;
    const sp = ServiceProvider({
        entityID: urlBase,
        nameIDFormat: [
            "urn:oasis:names:tc:SAML:2.0:nameid-format:persistent"
        ],
        assertionConsumerService: [
            { Binding: "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST", Location: `${urlBase}/login` }
        ],
        singleLogoutService: [
            { Binding: "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST", Location: `${urlBase}/logout` },
        ],
        wantAssertionsSigned: true
    });

    const extIDPrefix = samlConfig.id + "_";

    const samlRouter = express.Router();

    /** Get the metadata for our Service Provider */
    samlRouter.get('/metadata.xml', capture(async (request, response) => {
        response.status(200)
            .set("Content-Type", "application/xml")
            .send(sp.getMetadata());
    }));

    /** Request login, redirects to the Identity Provider */
    samlRouter.get('/login', capture(async (request, response) => {
        const { context } = sp.createLoginRequest(idp, 'redirect');
        response.redirect(context);
    }));

    /** Post back the SAML response to finish logging in */
    samlRouter.post('/login', capture(async (request, response) => {
        const result = await sp.parseLoginResponse(idp, 'post', request);
        const extID = extIDPrefix + result.extract.nameID;
        // TODO: remove temporary logging
        console.log("SAML response extract: ", result.extract);
        let user = undefined;
        try {
            user = await UserDB.getUserBySamlID(extID);
        } catch (err) {
            if (err instanceof NotFoundDatabaseError) {
                // TODO: if we don't get information we need here from SAML attributes,
                // then probably redirect the user to a page in the front-end where they 
                // enter that
                // If we do have the information, we can simply create the user right here
                // and return the login flow
                user = await UserDB.createUser({
                    samlID: extID,
                    userName: result.extract.nameID,
                    email: `${extID}@example.com`,
                    role: result.extract.attributes.role || "user",
                    password: UserDB.invalidPassword()
                });
            } else {
                throw err;
            }
        }
        (await setTokenCookie(response, user.ID)).redirect("/");
    }));

    /** Initiate Single Logout with a logout request to the IDP */
    samlRouter.get('/logout', capture(async (request, response) => {
        const userID = await getCurrentUserID(request);
        const extID = await UserDB.getSamlIDForUserID(userID);
        const samlID = extID.substring(extIDPrefix.length);
        const { context } = sp.createLogoutRequest(idp, 'redirect', { logoutNameID: samlID });
        clearTokenCookie(response).redirect(context);
    }));

    /** Parse the logout response */
    samlRouter.post('/logout', capture(async (request, response) => {
        await sp.parseLogoutResponse(idp, 'post', request);
        clearTokenCookie(response).redirect('/');
    }));

    /** Handle some SAML specific errors */
    samlRouter.use((err: Error & { code?: string }, request: Request, response: Response, next: NextFunction) => {
        if (err.code === "ERR_INVALID_ARG_TYPE") {
            // This means that the input to the SAML response validator was not valid
            next(new AuthError("saml.invalidResponse", "The login service returned an invalid response."));
        } else {
            next(err);
        }
    });

    return samlRouter;
}