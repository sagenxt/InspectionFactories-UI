# base image
FROM node:alpine

# Install system dependencies for sharp
RUN apk add --no-cache \
  build-base \
  vips-dev \
  curl

# create & set working directory
RUN mkdir -p /usr/src

WORKDIR /usr/src

# copy source files
COPY . /usr/src

# install dependencies
RUN yarn install

# start app
RUN yarn build

EXPOSE 80

CMD yarn dev