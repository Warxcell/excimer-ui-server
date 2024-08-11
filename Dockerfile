ARG NODE_VERSION=22
ARG NODE_ENV=production

FROM node:${NODE_VERSION}-slim AS base

WORKDIR /app

ENTRYPOINT ["yarn"]

FROM base AS builder

COPY --link package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY --link ./ ./

ARG NODE_ENV

RUN yarn build

RUN yarn install --production --frozen-lockfile

FROM base AS prod

ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV

COPY --link --from=builder /app ./

CMD ["start:prod"]