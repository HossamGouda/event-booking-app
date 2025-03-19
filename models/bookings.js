const mongoose = require("mongoose");
const {Schema, model} = mongoose;

const bookingSchema = new Schema(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {timestamps: true}
);

module.exports = model("Booking", bookingSchema);
