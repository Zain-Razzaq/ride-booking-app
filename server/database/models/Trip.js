import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    fromLocationId: {
      type: Number,
      required: [true, "From location is required"],
    },
    toLocationId: {
      type: Number,
      required: [true, "To location is required"],
    },
    rideType: {
      type: String,
      enum: ["bike", "car", "ricksha"],
      required: [true, "Ride type is required"],
    },
    fare: {
      type: Number,
      required: [true, "Fare is required"],
      min: [0, "Fare cannot be negative"],
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    bookingTime: {
      type: Date,
      default: Date.now,
    },
    startTime: {
      type: Date,
      default: null,
    },
    endTime: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


const Trip = mongoose.model("Trip", tripSchema);

export default Trip;
