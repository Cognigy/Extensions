FROM node:dubnium-alpine as builder

WORKDIR /app

COPY package*.json /app/

RUN npm i

COPY ./ /app/

RUN npm run build

# second stage
FROM node:dubnium-alpine

WORKDIR /app

COPY package*.json /app/

RUN npm i --production

COPY --from=builder /app/build /app/build

USER node

ENTRYPOINT [ "node", "/app" ]
