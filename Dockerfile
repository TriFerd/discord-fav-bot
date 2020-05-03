FROM node:13.14.0-alpine
WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install
COPY . .

CMD [ "node", "index.js" ]