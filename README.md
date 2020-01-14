
<div >
  <img src="./logo.png" width="80" >
</div>

# Atelier Core
### NPM run DEV-server not working using Prod instead fix coming soon
This repo contains the front-end and back-end of the atelier app. 
It does not contain the automated code checking please see atelier-PMD.
The development [Trello board](https://trello.com/b/UBKdT7aZ/atelier-prototype)
## Prerequisites
* Node.js (& NPM)
* MongoDB
* Development has only been done on linux, unknown problems may arise on other operating systems
* Visual Studio Code 

## Dev set-up

The dev setup relies upon the server being run from the vs code, the vs code launch option included in the repo. You should be able to run the program via debug in vscode, using the "Launch Program" Config.

You need to make sure that you have a mongoDB instance running locally.

1. Install all the Prerequisites.
2. Pull the repo from GitHub
3. Run npm install 
4. Build the project using `npm run dev-build`
5. Run `npm run start-db` to the the database, (this is not required if you mongodb is running) 
5. Run the server using the debug in vs code using the `Launch Program` config
6. View the dev environment by going to localhost:5000 in your browser


#### Optional Tools for Development
* **[React Chrome plugin](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en)**- Tool to help react debuggin
* **[NoSQLBooster](https://nosqlbooster.com/)** - GUI tool for NoSQL Databases
* **[Postman](https://www.getpostman.com/)** - A API testing tool

## Built with 

* [React](https://reactjs.org/) - Front end framework (written in Typescript)
* [Node.js](https://nodejs.org/en/)  with [express.js](https://expressjs.com/) - Back end Javascript server
* [Typescript](https://www.typescriptlang.org/) - A superset of Javascript


## Design Guidelines

### Icons 
The project is using [React Icon package](https://react-icons.netlify.com/#/) , which contains a number of icon packs. Preference should be given to the feather Icon pack;

### Design
Minimalism should be applied to all aspects of the design.
For further information on the design please contact Margot Rutgers. 


## Deployment 

If you want new features on master to be deployed to live please contact Andrew Heath.

## Contributing
If you wish to contribute please, first make a branch named after yourself or the features you are implementing.

## Authentication 
Authentication is done using [JWT-tokens](https://jwt.io/) is a session less approach to user authentication.
Tokens are stored in local storage.

## Generate keys
https://gist.github.com/ygotthilf/baa58da5c3dd1f69fae9

## Authors

* **[Andrew Heath](mailto:a.j.heath@student.utwente.nl)** - Repo Manager / Backend / Devops - 

* **Margot Rutgers** - Front-end


### Helpful commands

Kill running process
`fuser -k [port]/tcp` 
Start mongo
`sudo service mongod start`

linux571.ewi.utwente.nl

## Problems with webpack cli

https://stackoverflow.com/questions/16151018/npm-throws-error-without-sudo?page=1&tab=votes#tab-top
