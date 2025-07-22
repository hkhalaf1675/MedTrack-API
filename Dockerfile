FROM node:22-alpine

WORKDIR /app

RUN npm install pm2 -g

COPY package*.json .

RUN npm ci

COPY . .

ENV PORT=6000

EXPOSE 6000

RUN npm run build

CMD ["pm2-runtime", "dist/main.js"]