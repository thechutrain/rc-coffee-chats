# Use Node version 10
FROM mhart/alpine-node:10

# Lock python to 2.7 somehowa
RUN apk update && apk add python make g++ git
RUN git clone https://github.com/thechutrain/rc-coffee-chats.git app
WORKDIR /app
RUN git checkout -t origin/v2.1
RUN npm install

# COPY .env.example .env
ENV PORT 8081
ENV DEV_DB development.db
ENV PROD_DB production.db
ENV ZULIP_BOT_USERNAME USER
ENV ZULIP_BOT_API_KEY SEKRET_KEY
ENV ZULIP_URL_ENDPOINT=https://recurse.zulipchat.com/api/v1/messages
ENV GITHUB_URL=https://github.com/thechutrain/rc-coffee-chats
ENV HELP_URL=https://github.com/thechutrain/rc-coffee-chats

RUN touch ./data/production.db

EXPOSE 8081
CMD [ "npm", "start" ]
# Run node
# CMD ["node", "test.js"]%