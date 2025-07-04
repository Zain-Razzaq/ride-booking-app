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
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
locationSchema.index({ id: 1 });

const Location = mongoose.model("Location", locationSchema);

export default Location;
