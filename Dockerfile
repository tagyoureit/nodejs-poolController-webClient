FROM node:alpine as build
RUN apk add --no-cache make gcc g++ python linux-headers udev tzdata
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build:parcel
RUN npm prune --production

FROM node:alpine
RUN mkdir /app && chown node:node /app
WORKDIR /app
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/package.json ./
COPY --chown=node:node --from=build /app/web ./web
COPY --chown=node:node --from=build /app/dist ./dist

USER node
ENV NODE_ENV=production
ENTRYPOINT ["node", "dist/Server.js"]