const User = require("../models/user");
const Event = require("../models/event");
const {UserInputError, AuthenticationError} = require("apollo-server-express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const resolvers = {
  Query: {
    events: async () => {
      try {
        const events = await Event.find({}).populate("creator");
        return events.map((event) => {
          return {...event._doc, date: event.date.toDateString()};
        });
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    getUserEvents: async (_, args, context) => {
      try {
        if (!context.user) {
          throw new AuthenticationError("User not authenticated");
        }
        const events = await Event.find({creator: context.user._id});
        return events.map((event) => {
          return {...event._doc, date: event.date.toDateString()};
        });
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  },
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
        const token = jwt.sign(userForToken, process.env.JWT_SECRET);
        return {
          token,
          userId: user.id,
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
        const token = jwt.sign(userForToken, process.env.JWT_SECRET);
        return {
          token,
          userId: user.id,
          username: user.username,
        };
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    createEvent: async (_, args, context) => {
      try {
        if (!context.user) {
          throw new AuthenticationError("User not authenticated");
        }
        const existingEvent = await Event.findOne({
          title: args.eventInput.title,
        });
        if (existingEvent) {
          throw new UserInputError("Event already exists", {
            invalidArgs: args.eventInput.title,
          });
        }
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          date: new Date(args.eventInput.date),
          price: args.eventInput.price,
          creator: context.user._id,
        });
        await event.save();
        return {...event._doc, date: event.date.toDateString()};
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    deleteEvent: async (_, args, context) => {
      try {
        if (!context.user) {
          throw new AuthenticationError("User not authenticated");
        }
        await Event.deleteOne({_id: args.eventId});
        return Event.find({creator: context.user._id});
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  },
};

module.exports = {resolvers};
