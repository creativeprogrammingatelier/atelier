/** Helpers for reading configuration files */
import fs from 'fs';

const ENV = "ENV::";
const FILE = "FILE::";

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
    type: "builtin",
    /** Whether unauthenticated users are allowed to register accounts or not */
    register: boolean
}

/** Configuration for a plugin */
export interface PluginConfiguration {
    userID: string,
    webhookUrl: string,
    webhookSecret: string,
    publicKey: string,
    hooks: string[]
}

export interface Configuration {
    /** Value of the NODE_ENV environment variable */
    env: string,
    /** The domain where the application is hosted, including the preferred protocol */
    baseUrl: string,
    /** The hostname the server should listen on */
    hostname: string,
    /** The port to start the server on */
    port: number,
    /** 
     * List of authentication providers.
     * If multiple are given, the user is given the choice between them.
     * If only one is specified, the user will automatically be redirected.
     */
    loginProviders: Array<SamlLoginConfiguration | BuiltinLoginConfiguration>,
    /** Plugins that are added to this Atelier instance */
    plugins: PluginConfiguration[],
    /** Connection details for the external PostgreSQL database */
    database: {
        host: string,
        port: number,
        user: string,
        password: string,
        database: string
    }
}

/** Error thrown when the configuration is invalid */
export class ConfigurationError extends Error {
    constructor(message: string) {
        super(`Configuration: ${message}`);
    }
}

const env = process.env.NODE_ENV || "development";
const file = fs.readFileSync(`config/${env}.json`, 'utf8');
const json = JSON.parse(file);

/** Helper method that reads out a leaf property in the configuration */
function prop<T extends string | number | boolean>(name: string, value: T | undefined, defaultValue?: T): T {
    if (value === undefined) {
        if (defaultValue === undefined) {
            throw new ConfigurationError(`Required property ${name} was not specified.`);
        } else {
            return defaultValue;
        }
    } else {
        if (typeof value === "string"  && value.startsWith(ENV)) {
            return prop(name, process.env[value.substring(ENV.length)] as T, defaultValue);
        } else if (typeof value === "string" && value.startsWith(FILE)) {
            return prop(name, fs.readFileSync(value.substring(FILE.length), 'utf8') as T, defaultValue);
        } else {
            return value;
        }
    }
}

/** Configuration as read from config.env.json */
// This is a bit convoluted, as it turns untyped JSON with all kinds of optional
// fields into a typed TypeScript object with all fields filled in
// Because the optional fields may be leaf nodes, we have to dig in to all structures
export const config: Configuration = {
    env,
    baseUrl: prop("baseUrl", json.baseUrl),
    hostname: prop("hostname", json.hostname, env === "production" ? "0.0.0.0" : "127.0.0.1"),
    port: prop("port", json.port, 5000),
    plugins: json.plugins || [], // TODO: this should be database, so no error checking, it's "temporary"
    loginProviders: 
        json.loginProviders 
        // tslint:disable-next-line: no-any - It's fine, this is turning JSON into typed structure
        ? json.loginProviders.map((provider: any, i: number) => {
            const base = {
                type: prop(`loginProvider[${i}].type`, provider.type),
                id: prop(`loginProvider[${i}].id`, provider.id),
                name: prop(`loginProvider[${i}].name`, provider.name)
            }
            switch (base.type) {
                case "saml":
                    if (provider.metadata === undefined || !("url" in provider.metadata || "file" in provider.metadata)) {
                        throw new ConfigurationError(`loginProviders[${i}].metadata is required and should specify a url or file.`);
                    }
                    return {
                        ...base,
                        metadata: 
                            "url" in provider.metadata 
                            ? { url: prop(`loginProvider[${i}].metadata.url`, provider.metadata.url) }
                            : { file: prop(`loginProvider[${i}].metadata.file`, provider.metadata.file) }
                    }
                case "builtin": 
                    return {
                        ...base,
                        register: prop(`loginProvider[${i}].register`, provider.register, true)
                    }
                default: 
                    throw new ConfigurationError(`Invalid login provider type "${base.type}"`);
            }
        })
        : [{
            type: "builtin",
            id: "atelier",
            name: "Atelier",
            register: true
        }],
    database: {
        host: prop("database.host", json.database.host, "localhost"),
        port: prop("database.port", json.database.port, 5432),
        user: prop("database.user", json.database.user),
        password: prop("database.password", json.database.password),
        database: prop("database.database", json.database.database)
    }
};

// Configuration is immutable
Object.freeze(config);