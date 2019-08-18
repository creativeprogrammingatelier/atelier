
<div >
  <img src="./logo.png" width="100" >
</div>

# Atelier Core

This repo contains the front-end and back-end of the atelier app. 
It does not contain the automated code checking please see atelier-PMD.
The development [Trello board](https://trello.com/b/UBKdT7aZ/atelier-prototype)
## Prerequisites
* Node.js ( & NPM)
* MongoDB
* Visual Studio Code (Recommended editor)

## Installing

1. Install all the Prerequisites.
2. Clone the Repo on your computer.
3. Open the project in your editor of choice ( I recommend Visual studio code) 
4. Run: `npm i`
5. Create a [.gitignore](https://git-scm.com/docs/gitignore): containing: 
* /uploads
* /node_modules
* /dist 
* /bin
* /client/package-lock.json
* /package-lock.json
* /.vscode
Any development folders or settings that are not source code should not be in git
6. Navigate to the /api folder. and run:
`npm run start`
7. Navigate to the /client folder. and run:
`npm run watch`
8. Open [localhost:5000](localhost:5000)
9. Make a call  (using postman) to /register passing email, password and role in the body

### Developing
#### Optional Tools
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

* **[Andrew Heath](mailto:a.j.heath@student.utwente.nl)** - Full Stack - 

* **Margot Rutgers** - Full Stack

* **Carmen Burghardt** - Front-End and Design



### Helpful commands

Kill running process
fuser -k [port]/tcp 
