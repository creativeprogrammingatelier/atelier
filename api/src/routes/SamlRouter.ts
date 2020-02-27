import express from 'express';
import fetch from 'node-fetch';
import { ServiceProvider, IdentityProvider, setSchemaValidator } from 'samlify';
import * as validator from '@authenio/samlify-node-xmllint';
// If the above import complains about missing types, create this file:
//  node_modules/@authenio/samlify-node-xmllint/build/index.d.ts
// with these contents:
//  export declare const validate: (xml: string) => Promise<unknown>;
// Until https://github.com/authenio/samlify-node-xmllint/pull/1 is merged and published

import { capture } from '../helpers/ErrorHelper';

export const samlRouter = express.Router();

setSchemaValidator(validator);
const sp = ServiceProvider({
    entityID: "http://localhost:5000/api/auth/saml",
    nameIDFormat: [
        "urn:oasis:names:tc:SAML:2.0:nameid-format:transient"
    ],
    assertionConsumerService: [
        { Binding: "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST", Location: "http://localhost:5000/api/auth/saml" }
    ],
    wantAssertionsSigned: true
});

samlRouter.get('/metadata.xml', capture(async (request, response) => {
    response.status(200)
        .set("Content-Type", "application/xml")
        .send(sp.getMetadata());
}));

samlRouter.get('/login', capture(async (request, response) => {
    const metadata = await fetch("https://capriza.github.io/samling/public/metadata.xml").then(res => res.text());
    const idp = IdentityProvider({ metadata });

    const { context } = sp.createLoginRequest(idp, 'redirect');
    response.redirect(context);
}));

samlRouter.post('/', capture(async (request, response) => {
    const metadata = await fetch("https://capriza.github.io/samling/public/metadata.xml").then(res => res.text());
    const idp = IdentityProvider({ metadata });

    const result = await sp.parseLoginResponse(idp, 'post', request);
    response.send(result);
}));