
<div >
  <img src="./logo.png" width="100" >
</div>

# Atelier Core

This repo contains the front-end and back-end of the atelier app. 
It does not contain the automated code checking please see atelier-PMD.
The development [Trello board](https://trello.com/b/UBKdT7aZ/atelier-prototype)
## Prerequisites
* Node.js (& NPM)
* MongoDB
* Development has only been done on linux, unknown problems may arise on other operating systems
* Visual Studio Code (Recommended editor)

## Dev set-up

1. Install all the Prerequisites.
2. Pull the repo from GitHub
3. Run npm install 
4. Run npm dev - start Backend (if any packages are missing you npm i [package name] to install them)
5. Run npm watch - build (and watch) the react bundle
6. View the dev environment by going to localhost:5000 in your browser


#### Optional Tools for Development
* **[React Chrome plugin](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en)**- Tool to help react debuggin
* **[NoSQLBooster](https://nosqlbooster.com/)** - GUI tool for NoSQL Databases
* **[Postman](https://www.getpostman.com/)** - A API testing tool

## Built with 

* [React](https://reactjs.org/) - Front end framework (written in Typescript)
* [Node.js](https://nodejs.org/en/)  with [express.js](https://expressjs.com/) - Back end Javascript server
* [Typescript](https://www.typescriptlang.org/) - A superset of Javascript

## Contributing
If you wish to contribute please, first make a branch named after yourself or the features you are implementing.

## Authentication 
Authentication is done using [JWT-tokens](https://jwt.io/) is a session less approach to user authentication.
Tokens are stored in local storage.


## Authors

* **[Andrew Heath](mailto:a.j.heath@student.utwente.nl)** - Repo Manager / Backend / Devops - 

* **Margot Rutgers** - Front-end




### Helpful commands

Kill running process
`fuser -k [port]/tcp` 
Start mongo
`sudo service mongod start`


ssh s2054256@linux571.ewi.utwente.nl
