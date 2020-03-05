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

## Login providers

```json
"loginProviders": [
    {
        "type": "saml",
        "id": "samling",
        "name": "Samling",
        "metadata": { "url": "https://capriza.github.io/samling/public/metadata.xml" }
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

In the example above, there are configurations for two systems: a SAML connection to the Samling client-side testing service and the built in email/password system. All types have three fields in common: `type` specifying the type of provider, `id` specifying a unique internal identifier for the system (also used in URLs) and `name` specifying the name of the provider that is shown to the user.

If multiple providers are specified, the users is presented with a choice for the provider they want to use to log in. If only one is given, the user is automatically redirected.

### SAML link

To link Atelier to a SAML Identity Provider, you need to import the metadata file for the IDP in Atelier. This is done using the `metadata` field in a SAML login provider configuration. There are two options to link to the metadata file of your IDP:

- URL: `"metadata": { "url": "https://idp.example.com/metadata.xml" }`

  The file at this location will be downloaded when the server starts and the SAML endpoint will be configured for this Identity Provider.

- File: `"metadata": { "file": "config/idp_metadata.xml" }`

  If your IDP does not expose its metadata on the webserver, you can use a local copy of the metadata file to configure Atelier. The file will be read at the specified path, starting from the root of the application, when the server starts.

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