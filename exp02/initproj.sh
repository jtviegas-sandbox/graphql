#!/bin/bash

npm init -y
npm install apollo-server graphql nodemon

# apollo-server-express

npm remove apollo-server
npm install apollo-server-express express
npm install graphql-playground-middleware-express

