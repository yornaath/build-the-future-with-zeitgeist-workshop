FROM node:17

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN corepack enable

COPY . /usr/src/app

RUN npm install -g serve

CMD [ "serve", "-s", "-p", "3002", "./dist"]