/** Helpers for reading configuration files */
import fs from "fs";

const ENV = "ENV::";
const FILE = "FILE::";

const env = process.env.NODE_ENV || "development";
const file = fs.readFileSync(`config/${env}.json`, "utf8");
const json = JSON.parse(file);

export interface Configuration {
    /** Value of the NODE_ENV environment variable */
    env: string,
    /** The domain where the application is hosted, including the preferred protocol */
    baseUrl: string,
    /** The hostname the server should listen on */
    hostname: string,
    /** The port to start the server on */
    port: number,
    /** Should files of which Atelier doesn't recognize the type be displayed as text */
    openUnknownFiles: boolean,
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
        database: string,
        /** Extra configuration for the pool of connections */
        pool: {
            /** Maximum number of clients in the pool */
            max?: number,
            /** Maximum time to wait before timing out when connecting a new client */
            connectionTimeoutMillis?: number,
            /** Time to wait before disconnecting a client when it sits idle */
            idleTimeoutMillis?: number
        }
    },
    /** Canvas API integration connection information, or undefined if the integration is not enabled */
    canvas: {
        client_id: string,
        client_secret: string,
        /** Base URL of the Canvas instance */
        canvas_url_root: string
    } | undefined
}

interface LoginConfiguration {
    /** A unique internal identifier to use for this login method */
    id: string,
    /** A name to be displayed to the user */
    name: string,
    /** Determines if this login method should be shown in the list of login providers */
    hidden: boolean
}

/** Use an external SAML Identity Provider to login */
export interface SamlLoginConfiguration extends LoginConfiguration {
    type: "saml",
    /** The location for the metadata file of the Identity Provider */
    metadata: {url: string} | {file: string},
    /** Alternative base URL to use for redirecting back to Atelier */
    altBaseUrl?: string,
    /** The names of the attribute fields that contain user information */
    attributes?: {
        name?: string | {firstname: string, lastname: string},
        email?: string,
        role?: string,
        roleMapping?: {[key: string]: string}
    }
}

/** Use the built in login system */
export interface BuiltinLoginConfiguration extends LoginConfiguration {
    type: "builtin",
    /** Whether unauthenticated users are allowed to register accounts or not */
    register: boolean
}

/** Error thrown when the configuration is invalid */
export class ConfigurationError extends Error {
    constructor(message: string) {
        super(`Configuration: ${message}`);
    }
}

/** Helper method that reads out a leaf property in the configuration */
function prop<T extends string | number | boolean>(name: string, value: T | undefined, defaultValue?: T): T {
    if (value === undefined) {
        if (defaultValue === undefined) {
            throw new ConfigurationError(`Required property ${name} was not specified.`);
        } else {
            return defaultValue;
        }
    } else if (typeof value === "string" && value.startsWith(ENV)) {
        return prop(name, process.env[value.substring(ENV.length)] as T, defaultValue);
    } else if (typeof value === "string" && value.startsWith(FILE)) {
        return prop(name, fs.readFileSync(value.substring(FILE.length), "utf8") as T, defaultValue);
    } else {
        return value;
    }
}

/**
 * Configuration as read from config.env.json
 * This is a bit convoluted, as it turns untyped JSON with all kinds of optional
 * fields into a typed TypeScript object with all fields filled in
 * Because the optional fields may be leaf nodes, we have to dig in to all structures
 */
export const config: Configuration = {
    env,
    baseUrl: prop("baseUrl", json.baseUrl),
    hostname: prop("hostname", json.hostname, env === "production" ? "0.0.0.0" : "127.0.0.1"),
    port: prop("port", json.port, 5000),
    openUnknownFiles: prop("openUnknownFiles", json.openUnknownFiles, false),
    loginProviders:
            json.loginProviders ?
            // tslint:disable-next-line: no-any - It's fine, this is turning JSON into typed structure
                json.loginProviders.map((provider: any, i: number) => {
                    const base = {
                        type: prop(`loginProvider[${i}].type`, provider.type),
                        id: prop(`loginProvider[${i}].id`, provider.id),
                        name: prop(`loginProvider[${i}].name`, provider.name),
                        hidden: prop(`loginProviders[${i}].hidden`, provider.hidden, false)
                    };
                    switch (base.type) {
                    case "saml":
                        if (provider.metadata === undefined || !("url" in provider.metadata || "file" in provider.metadata)) {
                            throw new ConfigurationError(`loginProviders[${i}].metadata is required and should specify a url or file.`);
                        }
                        return {
                            ...base,
                            altBaseUrl: prop(`loginProvider[${i}].altBaseUrl`, provider.altBaseUrl, null),
                            metadata:
                                    "url" in provider.metadata
                                        ? {url: prop(`loginProvider[${i}].metadata.url`, provider.metadata.url)}
                                        : {file: prop(`loginProvider[${i}].metadata.file`, provider.metadata.file)},
                            attributes: provider.attributes
                        };
                    case "builtin":
                        return {
                            ...base,
                            register: prop(`loginProvider[${i}].register`, provider.register, true)
                        };
                    default:
                        throw new ConfigurationError(`Invalid login provider type "${base.type}"`);
                    }
                })
                :
                [{
                    type: "builtin",
                    id: "atelier",
                    name: "Atelier",
                    hidden: false,
                    register: true
                }],
    database: {
        host: prop("database.host", json.database.host, "localhost"),
        port: prop("database.port", json.database.port, 5432),
        user: prop("database.user", json.database.user),
        password: prop("database.password", json.database.password),
        database: prop("database.database", json.database.database),
        pool: {
            max: json.database.pool.max,
            connectionTimeoutMillis: json.database.pool.connectionTimeoutMillis,
            idleTimeoutMillis: json.database.pool.idleTimeoutMillis
        }
    },
    canvas:
            json.canvas ? {
                client_id: prop("canvas.client_id", json.canvas.client_id),
                client_secret: prop("canvas.client_secret", json.canvas.client_secret),
                canvas_url_root: prop("canvas.canvas_url_root", json.canvas.canvas_url_root)
            } : undefined
};

// Configuration is immutable
Object.freeze(config);
