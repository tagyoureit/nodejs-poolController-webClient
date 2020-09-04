FROM node:current

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build:parcel

ENTRYPOINT ["npm", "run", "start"]   