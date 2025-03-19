const express = require("express");
const {ApolloServer} = require("apollo-server-express");
const {ApolloServerPluginDrainHttpServer} = require("apollo-server-core");
const http = require("http");
const {typeDefs} = require("./Schema");
const {resolvers} = require("./resolvers");
require("dotenv").config();

async function startApolloServer(typeDefs, resolvers) {
  const app = express();
  const httpServer = http.createServer(app);
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({httpServer})],
  });
  await server.start();
  server.applyMiddleware({app});
  await new Promise((resolve) =>
    httpServer.listen({port: process.env.PORT || 4000}, resolve)
  );
  console.log(`Server ready at http://localhost:4000${server.graphqlPath}`);
}
startApolloServer(typeDefs, resolvers);
