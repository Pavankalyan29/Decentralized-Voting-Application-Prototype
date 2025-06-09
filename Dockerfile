FROM node:16-alpine

WOrKDIR /app

COPY . /app

RUN npm install

EXPOSE 3000

CMD [ "npm", "start" ]