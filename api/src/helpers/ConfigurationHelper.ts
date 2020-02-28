/** Helpers for reading configuration files */
import fs from 'fs';

interface LoginConfiguration {
    /** A unique internal identifier to use for this login method */
    id: string, 
    /** A name to be displayed to the user */
    name: string, 
}

/** Use an external SAML Identity Provider to login */
export interface SamlLoginConfiguration extends LoginConfiguration {
    type: "saml", 
    /** The location for the metadata file of the Identity Provider */
    metadata: { url: string } | { file: string }
}

/** Use the built in login system */
export interface BuiltinLoginConfiguration extends LoginConfiguration {
    type: "builtin"
}

export interface Configuration {
    /** Value of the NODE_ENV environment variable */
    env: string,
    /** The domain where the application is hosted, including the preferred protocol */
    host: string,
    /** The port to start the server on */
    port: number,
    /** 
     * List of authentication providers.
     * If multiple are given, the user is given the choice between them.
     * If only one is specified, the user will automatically be redirected.
     */
    loginProviders: Array<SamlLoginConfiguration | BuiltinLoginConfiguration>,
    /** Connection details for the external PostgreSQL database */
    database: {
        host: string,
        port: number,
        user: string,
        password: string,
        database: string
    }
}

const env = process.env.NODE_ENV || "development";
const file = fs.readFileSync(`config.${env}.json`, 'utf8');
const json = JSON.parse(file);

export const config: Configuration = {
    env,
    host: json.host,
    port: json.port || 5000,
    loginProviders: json.loginProviders || [ { type: "builtin" } ],
    database: {
        host: json.database.host || "localhost",
        port: json.database.port || 5432,
        user: json.database.user,
        password: json.database.password,
        database: json.database.database
    }
};