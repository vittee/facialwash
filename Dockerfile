FROM node:16-alpine

WORKDIR /facialwash

COPY ./build ./
RUN npm install

EXPOSE 4000
CMD [ "node", "." ]