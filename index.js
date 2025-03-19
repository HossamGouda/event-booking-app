const express = require("express");
const {ApolloServer} = require("apollo-server-express");
const {ApolloServerPluginDrainHttpServer} = require("apollo-server-core");
const http = require("http");
const {typeDefs} = require("./Schema");
const {resolvers} = require("./resolvers");
const mongoose = require("mongoose");
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
  console.log(process.env.DB_URL);
  mongoose.set("strictQuery", true);
  mongoose
    .connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB", err);
    });
}
startApolloServer(typeDefs, resolvers);
