import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: [true, "Location ID is required"],
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Location name is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Location address is required"],
      trim: true,
    },
    distances: {
      type: Map,
      of: Number,
      default: new Map(),
    },
  },
  {
    timestamps: true,
  }
);

const Location = mongoose.model("Location", locationSchema);

export default Location;
