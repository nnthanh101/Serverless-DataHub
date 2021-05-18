FROM node:14-alpine

WORKDIR /usr/src/app
COPY package*.json ./
COPY ./src/ ./src/

RUN npm ci --only=production

CMD [ "node", "src/index.js" ]