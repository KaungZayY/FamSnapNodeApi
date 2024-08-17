FROM node:18.20.2
RUN apt-get update && apt-get upgrade -y
WORKDIR /app
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install --production
COPY . .
CMD ["node","server.js"]