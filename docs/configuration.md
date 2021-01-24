# Configuration

Atelier is configured using configuration files in the JSON format. The files are located in a folder called `config` and named `environment.json`, where `environment` is the value of the `NODE_ENV` environment variable. The value is assumed to be `development` by default; on production servers it should be set to `production`. The file `config/example.json` shows an example configuration for development purposes.

The configuration file specifies all environment dependent variables for the project, so no source code changes should be needed to get it running. Here follows a description of all values that can be specified in the configuration file.

## Host and port

```json
"urlBase": "http://localhost:5000"
```

The start of the url where the application will be accessible. It should include the preferred protocol for accessing the application (which should be `https://` in production environments) and has no trailing slash.

```json
"hostname": "0.0.0.0"
```

The hostname the server should listen on. In production environments the default is 0.0.0.0, in development it defaults to 127.0.0.1 (localhost).

```json
"port": 5000
```

This specifies the port the application should listen on. If it is not provided, the default value will be 5000.

## Open unknown files

Atelier uses both the MIME type and the file extension to determine the type of file. If Atelier cannot determine the type of a file, it will by default not be displayed. If you want Atelier to display unrecognized files as text files, you can set the `openUnknownFiles` property:

```json
"openUnknownFiles": true
```

This setting is especially useful if Atelier is used with programming languages that are not currently recognized. Note that changing this setting only affects the files of new submissions, as the readability of a file is determined at the upload stage.

## Login providers

```json
"loginProviders": [
    {
        "type": "saml",
        "id": "samling",
        "name": "Samling",
        "metadata": { "url": "https://capriza.github.io/samling/public/metadata.xml" },
        "attributes": {
            "name": {
                "firstname": "urn:mace:dir:attribute-def:givenName",
                "lastname": "urn:mace:dir:attribute-def:sn"
            },
            "email": "urn:mace:dir:attribute-def:mail", 
            "role": "urn:mace:dir:attribute-def:eduPersonAffiliation",
            "roleMapping": {
                "student": "user",
                "employee": "staff"
            }
        }
    },
    {
        "type": "builtin",
        "id": "atelier",
        "name": "Atelier",
        "register": true
    }
]
```

Atelier supports the use of multiple ways to log in. There are currently two types of login: using the SAML system (for example linked to the university SSO system) or by using the built in email/password system. You can also choose to allow both types of sign in, or link multiple SAML systems to your instance of Atelier.

In the example above, there are configurations for two systems: a SAML connection to the Samling client-side testing service and the built in email/password system. All types have four fields in common: 

- `type`: the type of provider, either `"saml"` or `"builtin"`
- `id`: a unique internal identifier for the system (also used in URLs) 
- `name`: the name of the provider that is shown to the user
- `hidden` (optional): set to `true` if this provider should not be listed on the login screen. Note that it will still be possible to use this provider if the id is known by directly navigating to the login URL. Default value is `false`

If multiple providers are specified, the users is presented with a choice for the provider they want to use to log in. If only one is given, the user is automatically redirected.

### SAML link

To link Atelier to a SAML Identity Provider, you need to import the metadata file for the IDP in Atelier. This is done using the `metadata` field in a SAML login provider configuration. There are two options to link to the metadata file of your IDP:

- URL: `"metadata": { "url": "https://idp.example.com/metadata.xml" }`

  The file at this location will be downloaded when the server starts and the SAML endpoint will be configured for this Identity Provider.

- File: `"metadata": { "file": "config/idp_metadata.xml" }`

  If your IDP does not expose its metadata on the webserver, you can use a local copy of the metadata file to configure Atelier. The file will be read at the specified path, starting from the root of the application, when the server starts.

Optionally, you can also specify which attributes from a SAML response will be used to register the user, by setting the `attributes` field. You can configure values for the following three user properties:

- `name`: this can either be a string mapping to the name of the SAML attribute, or an object with a `firstname` and `lastname` property, mapping to SAML attributes for these. If this last option is used, the name of the user will be set to `firstname + " " + lastname`. Otherwise, the user's name will simply be set to the value of the referenced attribute.
- `email`: a string mapping to the name of a SAML attribute containing the email address of the user.
- `role`: a string mapping to the name of a SAML attribute from which the global role of the user in the Atelier system will be determined.

All of these fields are optional. If they are not set, default values will be assigned to the users signing in. For the name and email, it will be derived from the SAML `NameID` field, the role will default to user. The user can then change their name and email in the user settings.

For complicated deployments, Atelier supports serving a SAML authentication endpoint on a different base URL. This URL is then used in the SAML metadata file to identify the Atelier Service Provider and for the redirect URLs. It can be set using the `altBaseUrl` field on a SAML login provider configuration. If this is not set, the global application `baseUrl` will be used, which is recommended for most deployments. If you want to use this functionality, you are responsible for ensuring that proper redirects are set up for all URLs on a proxy server. You'll likely want to redirect all user traffic on the alternate URLs to your normal base URL, but the authentication endpoints should be directly accessible on the alternate urls. This means that the locations `/api/auth/*` (or `/api/auth/providerName/*` for a more specific setup) should not be redirected.

If your SAML provider uses different role names than Atelier, you can add a `roleMapping` field to the `attributes` object. The keys of this object are the values provided in the SAML attribute, the value assigned to the key is the role in Atelier. If a value in the SAML attribute is not defined in the `roleMapping`, it will be assumed that no mapping is required and the given role is a valid role in Atelier.

### Built in

For the built in login provider, you can choose whether you want to allow anyone to register to Atelier by setting the `register` field. If you set this to `true`, anyone will be able to create an account on your Atelier instance. If it is set to `false`, only logged in admins can create new users.

## Database

```json
"database": {
    "host": "localhost",
    "port": 5432,
    "user": "atelier",
    "password": "Pa$$w0rd.",
    "database": "atelier"
}
```

Atelier requires access to a PostgreSQL database with its table structure set up as can be done with `database/makeDB.js`. To connect to the database, the following fields are required to get access:

- `host` (optional): hostname or IP-address of the database server, defaults to localhost
- `port` (optional): the port PostgreSQL listens on, defaults to 5432
- `user`: the user that connects to the database
- `password`: the password of the user connecting to the database
- `database`: the name of the database Atelier should connect to

### Connection pool

Atelier uses a connection pool for the database, which can also be configured using the optional `pool` field on the database object, with three optional fields:

```json
"database": {
    "pool": {
        "max": 40,
        "connectionTimeoutMillis": 10000,
        "idleTimeoutMillis": 10000
    }
}
```

To learn more about these settings, please refer to the [node-postgres documentation](https://node-postgres.com/api/pool). Please note that for development environments, it is recommended to set the `max` field to allow 1 concurrent connection to the database. This way, it's easy to spot when you forget to release a client or try to use multiple clients within a transaction. On production servers this value should be set to scale with the number of concurrent users and the capacity of the database server.

## Canvas API Integration

Atelier can integrate with Canvas to import courses and automatically add all users. If you want to enable this integration, you need to add a `canvas` field to your integration:

```json
"canvas": {
    "client_id": "18217000xxxxxxxx",
    "client_secret": "XWQdS65BrQyurxxxxxxxxxxxxx",
    "canvas_url_root": "https://utwente-dev.instructure.com"
}
```

The three fields are all required and should be configured with the values received from your Canvas administrator:

- `client_id`: the client id of the Atelier application as configured in Canvas
- `client_secret`: the client secret of the Atelier application as configured in Canvas
- `client_url_root`: the base URL of the Canvas instance to connect to, without a trailing slash

While the three fields are all required when including the `canvas` block, the integration can be disabled by removing the entire block or setting `canvas` to undefined.

## Using environment variables or files

Atelier can also read configuration values from your environment variables or files on disk. This can be useful when the values are also needed by other processes, for example in the case of a database password. 

To use an environment variable, set the property in your `config/env.json` to `ENV::VARIABLE_NAME`. When reading the configuration, the value of this field will then be looked for in an environment variable called `VARIABLE_NAME`. In the following case, the field `port` will be read from the `PORT` environment variable:

```json
"port": "ENV::PORT"
```

To read a file from disk, set the property to `FILE::/path/to/file`. The value for this field will then be read from the specified file. In this example, the database password is read from a Docker secret file:

```json
"database": {
    "password": "FILE::/run/secrets/db_password"
}
```

Note that it is only possible to set values in your configuration that would be strings, numbers or booleans this way. Reading objects from environment variables or files is not supported.