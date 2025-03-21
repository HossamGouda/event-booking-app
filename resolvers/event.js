const Event = require("../models/event");
const {transformEvent} = require("./transform");
const {UserInputError} = require("apollo-server-express");
const {combineResolvers} = require("graphql-resolvers");
const isLoggedIn = require("../middlewares/isLogin");

const eventResolver = {
  Query: {
    events: async () => {
      try {
        const events = await Event.find({}).populate("creator");
        return events.map((event) => {
          return transformEvent(event);
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
          return transformEvent(event);
        });
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  },
  Mutation: {
    createEvent: combineResolvers(isLoggedIn, async (_, args, context) => {
      try {
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
        return transformEvent(event);
      } catch (error) {
        console.log(error);
        throw error;
      }
    }),
    deleteEvent: combineResolvers(isLoggedIn, async (_, args, context) => {
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
    }),
  },
};

module.exports = {eventResolver};
