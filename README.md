
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
4. Run: `npm i` in both the 'api' and 'client' folders
5. -
6. Navigate to the /api folder. and run:
`npm run start`
7. Navigate to the /client folder. and run:
`npm run watch`
- If during any of these steps it starts complaining 'module X is missing', `npm install X`
8. Open [localhost:5000](localhost:5000)
9. Make a call  (using postman) to /register passing email, password and role in the body
- Install [Postman](https://www.getpostman.com/)
- Create a POST request (dropwdown) to `localhost:5000/register`
- Select Body, Select 'raw', Change 'Text' to 'JSON' in dropdown and enter something like `{"email":"margot@example.com", "password":"1234", "role":"ta"}`.

### Developing
#### Optional Tools
* **[React Chrome plugin](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en)**- Tool to help react debuggin
* **[NoSQLBooster](https://nosqlbooster.com/)** - GUI tool for NoSQL Databases
* **[Postman](https://www.getpostman.com/)** - A API testing tool

### Deployment (being expanded)
#### setup debug: 
https://fettblog.eu/typescript-node-visual-studio-code/

## Using
pm2
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
`fuser -k [port]/tcp` 
Start mongo
`sudo service mongod start`

ssh s2054256@linux571.ewi.utwente.nl
