# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.4.0
ARG PNPM_VERSION=8.6.7

FROM node:${NODE_VERSION}-alpine as base

WORKDIR /app

RUN npm install -g pnpm@${PNPM_VERSION}

FROM base as deps

RUN apk update
RUN apk upgrade
RUN apk add --no-cache ffmpeg make gcc g++ python3 libwebp-tools ttf-dejavu ttf-freefont ttf-liberation

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    pnpm install --prod --frozen-lockfile --ignore-scripts


FROM deps as build

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    pnpm install --frozen-lockfile --ignore-scripts

RUN npm rebuild bcrypt --build-from-source

COPY . .

RUN pnpm run build

FROM deps as final

RUN npm uninstall -g pnpm
RUN apk del make gcc g++ python3

ENV NODE_ENV production

USER node

COPY package.json .
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY --from=build /app/sql ./sql

CMD npm run db:migrate && node build/index.js
