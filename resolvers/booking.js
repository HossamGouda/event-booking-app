const Event = require("../models/event");
const Booking = require("../models/bookings");
const {transformBooking, transformEvent} = require("./transform");
const {UserInputError} = require("apollo-server-express");
const {combineResolvers} = require("graphql-resolvers");
const {isLoggedIn} = require("../middlewares/isLogin");

const bookingResolver = {
  Query: {
    bookings: combineResolvers(isLoggedIn, async (_, __, context) => {
      try {
        const bookings = await Booking.find({user: context.user._id})
          .populate("event")
          .populate("user");
        return bookings.map((booking) => {
          return transformBooking(booking);
        });
      } catch (error) {
        console.log(error);
        throw error;
      }
    }),
  },
  Mutation: {
    bookEvent: combineResolvers(isLoggedIn, async (_, args, context) => {
      try {
        const existingBooking = await Booking.find({event: args.eventId}).find({
          user: context.user,
        });
        if (existingBooking.length > 0) {
          throw new UserInputError("Booking already exists", {
            invalidArgs: args.eventId,
          });
        }
        const fetchedEvent = await Event.findOne({_id: args.eventId});
        const booking = new Booking({
          event: fetchedEvent,
          user: context.user._id,
        });

        await booking.save();
        return transformBooking(booking);
      } catch (error) {
        console.log(error);
        throw error;
      }
    }),
    cancelBooking: combineResolvers(isLoggedIn, async (_, args, context) => {
      try {
        const booking = await Booking.findById(args.bookingId).populate(
          "event"
        );
        const event = transformEvent(booking.event);
        await Booking.deleteOne({_id: args.bookingId});
        return event;
      } catch (error) {
        console.log(error);
        throw error;
      }
    }),
  },
};

module.exports = {bookingResolver};
