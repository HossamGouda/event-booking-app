const {gql} = require("apollo-server-express");

const typeDefs = gql`
  type Query {
    greeting: String
  }
`;

module.exports = {typeDefs};
