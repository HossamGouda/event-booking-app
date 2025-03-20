const express = require("express");
const {ApolloServer} = require("apollo-server-express");
const {ApolloServerPluginDrainHttpServer} = require("apollo-server-core");
const http = require("http");
const {typeDefs} = require("./Schema");
const {resolvers} = require("./resolvers");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("./models/user");
require("dotenv").config();

async function startApolloServer(typeDefs, resolvers) {
  const app = express();
  const httpServer = http.createServer(app);
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({httpServer})],
    context: async ({ req }) => {
      const auth = req ? req.headers.authorization : null;
      if (auth) {
        const decodedToken = jwt.verify(auth.slice(4), process.env.JWT_SECRET);
        const user = await User.findById(decodedToken.id);
        return { user };
      }
    },
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
