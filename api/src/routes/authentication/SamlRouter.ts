import express, {Request, Response, NextFunction} from "express";
import fetch from "node-fetch";
import {ServiceProvider, IdentityProvider, setSchemaValidator} from "samlify";

import * as validator from "@authenio/samlify-node-xmllint";

import {GlobalRole} from "../../../../models/enums/GlobalRoleEnum";

import {AuthError, setTokenCookie} from "../../helpers/AuthenticationHelper";
import {config, SamlLoginConfiguration} from "../../helpers/ConfigurationHelper";
import {checkEnum, getEnum} from "../../../../helpers/EnumHelper";
import {capture} from "../../helpers/ErrorHelper";
import {readFileAsString} from "../../helpers/FilesystemHelper";

import {NotFoundDatabaseError} from "../../database/DatabaseErrors";
import {UserDB} from "../../database/UserDB";

setSchemaValidator(validator);

export async function getSamlRouter(samlConfig: SamlLoginConfiguration) {
	// Construct the SAML IDP from its metadata
	const idp = IdentityProvider({
		metadata:
			"url" in samlConfig.metadata ?
				await fetch(samlConfig.metadata.url).then(res => res.text())
				:
				await readFileAsString(samlConfig.metadata.file)
		}
	);
	
	// Create the SAML SP metadata for our application
	const urlBase = `${config.baseUrl}/api/auth/${samlConfig.id}`;
	const sp = ServiceProvider({
		entityID: urlBase,
		nameIDFormat: [
			"urn:oasis:names:tc:SAML:2.0:nameid-format:persistent"
		],
		assertionConsumerService: [
			{Binding: "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST", Location: `${urlBase}/login`}
		],
		// TODO: Figure out how Single logout works
		// singleLogoutService: [
		//     { Binding: "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST", Location: `${urlBase}/logout` },
		// ],
		wantAssertionsSigned: true
	});
	
	const extIDPrefix = samlConfig.id + "_";
	
	const samlRouter = express.Router();
	
	/** Get the metadata for our Service Provider */
	samlRouter.get("/metadata.xml", capture(async(request, response) => {
		response.status(200)
			.set("Content-Type", "application/xml")
			.send(sp.getMetadata());
	}));
	
	/** Request login, redirects to the Identity Provider */
	samlRouter.get("/login", capture(async(request, response) => {
		const {context} = sp.createLoginRequest(idp, "redirect");
		response.redirect(context);
	}));
	
	/** Post back the SAML response to finish logging in */
	samlRouter.post("/login", capture(async(request, response) => {
		const {extract: result} = await sp.parseLoginResponse(idp, "post", request);
		const extID = extIDPrefix + result.nameID;
		// TODO: remove temporary logging
		console.log("SAML response extract: ", result);
		let user = undefined;
		try {
			user = await UserDB.getUserBySamlID(extID);
		} catch (err) {
			if (err instanceof NotFoundDatabaseError) {
				// Get name from SAML attributes
				let userName = result.nameID;
				if (samlConfig.attributes?.name !== undefined) {
					if (typeof samlConfig.attributes.name === "string") {
						userName = result.attributes[samlConfig.attributes.name] || userName;
					} else {
						const lastname = result.attributes[samlConfig.attributes.name.lastname];
						const firstname = result.attributes[samlConfig.attributes.name.firstname];
						if (lastname !== undefined && firstname !== undefined) {
							userName = firstname + " " + lastname;
						} else if (lastname !== undefined) {
							userName = lastname;
						} else if (firstname !== undefined) {
							userName = firstname;
						}
					}
				}
				
				// Get email from SAML attributes
				// TODO: find a better default value for email
				let email = extID + "@example.com";
				if (samlConfig.attributes?.email !== undefined) {
					email = result.attributes[samlConfig.attributes.email] || email;
				}
				
				// Get role from SAML attributes
				let role = GlobalRole.user;
				if (samlConfig.attributes?.role !== undefined) {
					let samlRole = result.attributes[samlConfig.attributes.role] || role;
					if (samlConfig.attributes.roleMapping !== undefined) {
						samlRole = samlConfig.attributes.roleMapping[role] || role;
					}
					if (checkEnum(GlobalRole, samlRole)) {
						role = getEnum(GlobalRole, samlRole);
					}
				}
				
				user = await UserDB.createUser({
					samlID: extID, userName, email, globalRole: role,
					password: UserDB.invalidPassword()
				});
			} else {
				throw err;
			}
		}
		(await setTokenCookie(response, user.ID)).redirect("/");
	}));
	
	// /** Initiate Single Logout with a logout request to the IDP */
	// samlRouter.get('/logout', capture(async (request, response) => {
	//     const userID = await getCurrentUserID(request);
	//     const extID = await UserDB.getSamlIDForUserID(userID);
	//     const samlID = extID.substring(extIDPrefix.length);
	//     const { context } = sp.createLogoutRequest(idp, 'redirect', { logoutNameID: samlID });
	//     clearTokenCookie(response).redirect(context);
	// }));
	
	// /** Parse the logout response */
	// samlRouter.post('/logout', capture(async (request, response) => {
	//     await sp.parseLogoutResponse(idp, 'post', request);
	//     clearTokenCookie(response).redirect('/');
	// }));
	
	/** Handle some SAML specific errors */
	samlRouter.use((err: Error & {code?: string}, request: Request, response: Response, next: NextFunction) => {
		if (err.code === "ERR_INVALID_ARG_TYPE") {
			// This means that the input to the SAML response validator was not valid
			next(new AuthError("saml.invalidResponse", "The login service returned an invalid response."));
		} else {
			next(err);
		}
	});
	
	return samlRouter;
}