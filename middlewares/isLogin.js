const {AuthenticationError} = require("apollo-server-express");

const isLoggedIn = (parent, args, {user}, info) => {
  if (!user) {
    throw new AuthenticationError("User not authenticated");
  }
  return parent;
};

module.exports = {isLoggedIn};
