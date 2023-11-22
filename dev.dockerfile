# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.4.0
ARG PNPM_VERSION=8.6.7

FROM node:${NODE_VERSION}-alpine as base

WORKDIR /app

RUN apk update
RUN apk upgrade
RUN apk add --no-cache  make gcc g++ python3
RUN npm install -g pnpm@${PNPM_VERSION}

COPY package.json pnpm-lock.yaml ./

RUN pnpm i --ignore-scripts
RUN npm rebuild bcrypt --build-from-source # bcrypt requires python and a c++ compiler

COPY . .

ENV NODE_ENV development

#USER node

CMD pnpm db:migrate && pnpm dev:local
