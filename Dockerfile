FROM node:20-alpine As production
WORKDIR /usr/src/app

RUN npm install -g pnpm
ENV NODE_ENV production

COPY --chown=node:node . .
RUN pnpm install

CMD [ "pnpm", "run", "start" ]