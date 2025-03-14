FROM node:20-alpine

# Instalar el cliente Docker en Alpine. En Alpine el paquete se llama "docker-cli".
RUN apk add --no-cache docker-cli

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3030

CMD ["npm", "start"]