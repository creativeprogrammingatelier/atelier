/** Helpers for reading configuration files */
import fs from "fs";

const ENV = "ENV::";
const FILE = "FILE::";

const env = process.env.NODE_ENV || "development";
const file = fs.readFileSync(`config/${env}.json`, "utf8");
// It's fine, the JSON structure will be checked
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const json: any = JSON.parse(file) as unknown;

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
        clientId: string,
        clientSecret: string,
        /** Base URL of the Canvas instance */
        baseUrl: string
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
// This function reads its value from the JSON, so we allow any and check the type in the function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function prop<T extends string | number | boolean>(name: string, value: any, defaultValue?: T): T {
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
    } else if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        return value as T;
    } else {
        throw new ConfigurationError(`Property ${name} is not a string, number or boolean.`);
    }
}

/**
 * Configuration as read from config.env.json
 * This is a bit convoluted, as it turns untyped JSON with all kinds of optional
 * fields into a typed TypeScript object with all fields filled in
 * Because the optional fields may be leaf nodes, we have to dig in to all structures
 */
/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
export const config: Configuration = {
    env,
    baseUrl: prop<string>("baseUrl", json.baseUrl),
    hostname: prop<string>("hostname", json.hostname, env === "production" ? "0.0.0.0" : "127.0.0.1"),
    port: prop<number>("port", json.port, 5000),
    openUnknownFiles: prop<boolean>("openUnknownFiles", json.openUnknownFiles, false),
    loginProviders:
            json.loginProviders ?
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (json.loginProviders as unknown[]).map((provider: any, i: number) => {
                    const base = {
                        type: prop<string>(`loginProvider[${i}].type`, provider.type),
                        id: prop<string>(`loginProvider[${i}].id`, provider.id),
                        name: prop<string>(`loginProvider[${i}].name`, provider.name),
                        hidden: prop<boolean>(`loginProviders[${i}].hidden`, provider.hidden, false)
                    };
                    switch (base.type) {
                    case "saml":
                        if (provider.metadata === undefined || !("url" in provider.metadata || "file" in provider.metadata)) {
                            throw new ConfigurationError(`loginProviders[${i}].metadata is required and should specify a url or file.`);
                        }
                        return {
                            ...base,
                            type: "saml", // Repeated, because it needs to be a constant to please TypeScript
                            altBaseUrl: prop<string>(`loginProvider[${i}].altBaseUrl`, provider.altBaseUrl, undefined),
                            metadata:
                                    "url" in provider.metadata
                                        ? {url: prop<string>(`loginProvider[${i}].metadata.url`, provider.metadata.url)}
                                        : {file: prop<string>(`loginProvider[${i}].metadata.file`, provider.metadata.file)},
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                            attributes: provider.attributes
                        };
                    case "builtin":
                        return {
                            ...base,
                            type: "builtin",
                            register: prop<boolean>(`loginProvider[${i}].register`, provider.register, true)
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
        host: prop<string>("database.host", json.database.host, "localhost"),
        port: prop<number>("database.port", json.database.port, 5432),
        user: prop<string>("database.user", json.database.user),
        password: prop<string>("database.password", json.database.password),
        database: prop<string>("database.database", json.database.database),
        pool: {
            max: json.database.pool.max as number | undefined,
            connectionTimeoutMillis: json.database.pool.connectionTimeoutMillis as number | undefined,
            idleTimeoutMillis: json.database.pool.idleTimeoutMillis as number | undefined
        }
    },
    canvas:
        json.canvas ? {
            clientId: prop("canvas.clientId", json.canvas.clientId),
            clientSecret: prop("canvas.clientSecret", json.canvas.clientSecret),
            baseUrl: prop("canvas.baseUrl", json.canvas.baseUrl)
        } : undefined
};

// Configuration is immutable
Object.freeze(config);
