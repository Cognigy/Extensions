FROM node:12

# Create app directory
WORKDIR /app

COPY package*.json ./

RUN npm ci

# Bundle app source
COPY . .

EXPOSE 8081
CMD [ "node", "/app" ]