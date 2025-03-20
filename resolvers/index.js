const User = require("../models/user");
const {UserInputError} = require("apollo-server-express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const resolvers = {
  Query: {},
  Mutation: {
    createUser: async (_, args) => {
      try {
        const existingUser = await User.findOne({email: args.userInput.email});
        if (existingUser) {
          throw new UserInputError("User already exists", {
            invalidArgs: args.userInput.email,
          });
        }
        const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
        const user = new User({
          username: args.userInput.username,
          email: args.userInput.email,
          password: hashedPassword,
        });
        await user.save();
        const userForToken = {
          userId: user.id,
          email: user.email,
        };
        return {
          userId: user.id,
          token: jwt.sign(userForToken, process.env.JWT_SECRET, {}),
          username: user.username,
        };
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    login: async (_, {email, password}) => {
      try {
        const user = await User.findOne({email: email});
        if (!user) {
          throw new UserInputError("User not found", {
            invalidArgs: email,
          });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          throw new UserInputError("Invalid password", {
            invalidArgs: password,
          });
        }
        const userForToken = {
          userId: user.id,
          email: user.email,
        };
        return {
          userId: user.id,
          token: jwt.sign(userForToken, process.env.JWT_SECRET, {}),
          username: user.username,
        };
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  },
};

module.exports = {resolvers};
