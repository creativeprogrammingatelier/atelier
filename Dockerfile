FROM node:10

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm run kill
RUN npm install
COPY . .
EXPOSE 3000
CMD [ "npm", "run", "prod" ]