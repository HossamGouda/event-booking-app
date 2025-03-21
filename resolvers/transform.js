const transformEvent = (event) => {
  return {...event._doc, date: event.date.toDateString()};
};

const transformBooking = (booking) => {
  return {
    ...booking._doc,
    createdAt: booking.createdAt.toDateString(),
    updatedAt: booking.updatedAt.toDateString(),
  };
};

module.exports = {transformEvent, transformBooking};
