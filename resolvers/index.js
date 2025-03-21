const {authResolver} = require("./auth");
const {bookingResolver} = require("./booking");
const {eventResolver} = require("./event");
const {merge} = require("lodash");

const resolvers = merge(authResolver, bookingResolver, eventResolver);

module.exports = {resolvers};
