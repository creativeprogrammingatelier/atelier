<h1 align="center">
    <img src="./logo.png" alt="Atelier" height="200" align="center" />
</h1>

Atelier is an online environment to assist with programming tutorials. It facilitates interactions between students and teaching assistants to help them with their programming projects, allowing students to easily share and discuss their code with teaching assistants. Atelier is part of a [research project](https://www.utwente.nl/en/eemcs/fmt/research/projects/atelier/) of the FMT group at [The University of Twente](https://www.utwente.nl/en/).

## Developing Atelier

Please also have a look at the [Contributing Guidelines](CONTRIBUTING.md) if you plan to contribute to the project. This section will explain how to set up your development environment and run Atelier on your own machine. You'll need the following tools installed:

- [Node.js](https://nodejs.org/): to run the backend server and development tools (the LTS version is recommended, but other versions might work too)
- [PostgreSQL](https://www.postgresql.org/): to run a local database (but you can also use a remote database, if you prefer)
- Some editor that supports TypeScript and preferably ESLint and editorconfig (e.g. [Visual Studio Code](https://code.visualstudio.com), [WebStorm](https://www.jetbrains.com/webstorm/))
  - If you choose to use VS Code, these extensions will be automatically suggested when opening the repo.

Once you've got the tooling set up, we can start with getting Atelier running:

1. Clone the repo and switch to the atelier directory

2. Run `npm install` to install the dependencies. If this command changed the *package-lock.json* file, you may want to run it again.

3. Create a development configuration:

   1. Copy */config/example.json* to */config/development.json*
   2. Set the database `user`, `database` and `password` to the values you configured while installing PostgreSQL

4. Run `npm run compile` to compile the backend

5. Run `npm run database-dev` to set up the database structure and add some development sample data

6. Run `npm run watch-frontend` to run webpack in watch mode to compile the frontend application

7. Run `npm run start` to start the server

8. Navigate to <http://localhost:5000>

9. You will be shown the login page. Click on the *Sustainsys Stub IDP* button to log in. In the *Subject NameId* field, fill in one of the following user identifiers:

   - `admin` - a global admin user, who is allowed to do anything in the system
   - `user` - a global 'user' user, who is enrolled in a course as a student
   - `teacher` - a global staff user, who is enrolled in a course as a teacher
   - `TA` - a global 'user' user, who is enrolled in a course as a teaching assistant

   Leave all other fields as they are and click the *Log in* button to log in.

Now you are ready to start developing Atelier further. Also take a look at the [*/docs/dev*](/docs/dev) folder for more information about developing all parts of the Atelier system.

### npm run scripts

In *package.json*, a couple scripts are defined to do common operations while developing Atelier. Here's an overview of all of them by type of action:

**Compiling**

- `compile` - Compile the backend using the TypeScript compiler
- `prepare` - Alias for `compile`
- `compile-frontend` - Compile the frontend React application using webpack in production mode

**Running and watching**

- `start` - Start the server
- `watch-backend` - Compile the backend using the TypeScript compiler in watch mode
- `watch-frontend` - Compile the frontend React application using webpack in development mode

**Linting and code style**

- `lint` - Run ESLint on the code, reporting errors and warnings
- `lint-fix` - Run ESLint and try to fix all errors and warnings that can be automatically fixed
- `lint-nowarn` - Run ESLint on the code, reporting errors only
- `lint-nowarn-fix` - Run ESLint and try to fix all errors that can be automatically fixed

**Testing**

- `test` - Run all tests, alias for `test-backend` and `test-frontend` combined
- `test-backend` - Run the tests for the backend
- `test-backend-nyc` - Run the tests for the backend with coverage detection (using the nyc package)
- `test-frontend` - Run the tests for the frontend

*Note:* the backend tests require a connection to a database with sample data, which can be generated using the commands below.

**Database**

- `database-build` - Create the database table structure, dropping old tables if they already exist
- `database-samples` - Add sample data to an existing database structure
- `database-dev` - Set up the database for development, including sample data

**Documentation**

- `generate-docs` - Generate a typedoc documentation website from the inline code documentation

### Optional Tools for Development

These are some useful tools you might want to use when working on Atelier:

* React Developer Tools ([Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)/[Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)) - Plugin that helps with debugging React applications
* [Postman](https://www.getpostman.com/) - An API testing tool

## Running Atelier in Production

The best way to run Atelier in your own production environment, is by using the Docker image, which is available [here via GitHub](https://github.com/creativeprogrammingatelier/atelier/pkgs/container/atelier). Alternatively, you can build the image from this repo using the `docker build . -t atelier` command, to create an image called `atelier`.

The image exposes three volumes:

- `/atelier/config` - the folder containing the configuration files to set up Atelier for your environment
- `/atelier/uploads` - the folder where uploaded projects will be stored
- `/atelier/api/keys` - the folder where (generated) RSA keys for signing JWT tokens will be stored

Mounting the first volume to a folder containing a file called *production.json* is required for Atelier to run. Atelier will run without mounting the other two folders, but uploaded projects will be discarded when the container is restarted or a new version is deployed. Not mounting `atelier/api/keys` will lead to all existing tokens being invalidated when a new version is deployed, potentially causing hiccups in the user experience.

### Configuration

An example configuration file can be found at [*config/example.json*](/config/example.json). This file, however, is mainly meant to provide default values in a development environment and it should be modified to align with your environment. When running in a Docker container, it is recommended to use the [Docker secrets](https://docs.docker.com/engine/swarm/secrets/) mechanism to configure some of your sensitive values:

```json
{
    "baseUrl": "https://atelier.example.com",
    "port": "ENV::EXPOSED_PORT",
    "loginProviders": [ ],
    "database": {
        "host": "database-container-name",
        "user": "FILE::/run/secrets/database_user",
        "database": "FILE::/run/secrets/database_user",
        "password": "FILE::/run/secrets/database_password",
        "pool": {
            "max": 60
        }
    }
}
```

The Docker image uses the `EXPOSED_PORT` environment variable to decide the port that the container exposes, so we configure Atelier to listen on that port using the `ENV::` syntax. The secret values for the database connection are set using Docker secrets, so those are mapped to their respective file locations. Take a look at [*/docs/configuration.md*](/docs/configuration.md) learn more about all configuration options Atelier provides.

### Using docker-compose

Since Atelier needs access to a PostgreSQL database, it is preferred to set up a docker-compose environment, in which both containers are setup correctly:

```yaml
version: '3.7'
services:
  atelier:
    image: ghcr.io/creativeprogrammingatelier/atelier
    restart: always
    ports:
      - 80:5000
    volumes:
      - ./config:/atelier/config
      - ./uploads:/atelier/uploads
      - ./secrets/jwt:/atelier/api/keys
    secrets:
      - database_user
      - database_password
  database:
    image: postgres
    restart: always
    environment:
      POSTGRES_DB_FILE: /run/secrets/database_user
      POSTGRES_USER_FILE: /run/secrets/database_user
      POSTGRES_PASSWORD_FILE: /run/secrets/database_password
    volumes:
      - ./database/data:/var/lib/postgresql/data
    secrets:
      - database_user
      - database_password
secrets:
  database_user:
    file: ./secrets/database_user
  database_password:
    file: ./secrets/database_password
```

This setup uses files in the *./secrets* folder to configure the database username and password across the two containers, and mounts all volumes for persistent data to folders in the current working directory. A configuration file called *production.json* is assumed to be available in the *./config* folder.

In practice, we recommend running Atelier behind a proxy server that allows for HTTPS connections, instead of directly exposing Atelier on only port 80 (HTTP). You could, for example, add an [nginx container](https://hub.docker.com/_/nginx/) to your docker-compose configuration, or use an external proxy server.

### First run setup

After both containers are started, the database needs to be set up with the correct structure. To do this, run

```
docker exec atelier_atelier_1 node api/src/database/structure/DatabaseStructure.js
```

where you replace `atelier_atelier_1` with the name of your Atelier container.

## Documentation

The above should help you get started with running and developing Atelier. More specific documentation is available in the [*/docs*](/docs) folder: this is mainly conceptual documentation about the whole structure of the project. Most files (and they really all should) include inline JSDoc documentation describing specific functionalities. If you prefer, you can also run the `npm run generate-docs` command to create a TypeDoc website based on this inline documentation. The website files can then be found in the [*/docs/typedoc*](/docs/typedoc) folder.

## Design Guidelines

The Atelier design is based on Bootstrap, with additional custom styling for the distinctive Atelier look.

### Icons

The project is using [React Icon package](https://react-icons.netlify.com/#/), which contains a number of icon packs. Preference should be given to the [Feather](https://react-icons.netlify.com/#/icons/fi) Icon pack.

## Contributing

If you wish to contribute, please first make a branch named after yourself or the features you are implementing. If you plan to do a larger amount of work, please first open an issue to discuss your plans. This prevents double work and other forms of disappointment.

## Contributors

* [Andrew Heath](mailto:a.j.heath@student.utwente.nl)
* Margot Rutgers
* Alexander Haas
* Jarik Karsten
* Rens Leendertz
* [Arthur Rump](https://github.com/arthurrump)
* Cas Sievers
