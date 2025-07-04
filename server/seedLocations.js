import mongoose from "mongoose";
import { createLocations, locationsExist } from "./database/locations.js";

const locations = [
  { id: 1, name: "City Center", address: "Main Street, Downtown" },
  { id: 2, name: "Airport", address: "Allama Iqbal International Airport" },
  { id: 3, name: "Train Station", address: "Lahore Railway Station" },
  { id: 4, name: "Emporium Mall", address: "Johar Town" },
  { id: 5, name: "University", address: "University of Lahore" },
  { id: 6, name: "Jinnah Hospital", address: "Jinnah Hospital" },
  { id: 7, name: "Gadaffi Stadium", address: "Gadaffi Stadium" },
  { id: 8, name: "Faisal Town", address: "Faisal Town" },
  { id: 9, name: "DHA Raya", address: "DHA Raya" },
  { id: 10, name: "Lake City", address: "Lake City" },
];

const seedLocations = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/ridebooking"
    );
    console.log("Connected to MongoDB");

    // Check if locations already exist
    const result = await locationsExist();
    if (result.exists) {
      console.log("Locations already exist in database");
      process.exit(0);
    }

    // Create locations
    const createResult = await createLocations(locations);
    if (createResult.success) {
      console.log("Locations seeded successfully");
    } else {
      console.error("Failed to seed locations:", createResult.message);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error seeding locations:", error);
    process.exit(1);
  }
};

seedLocations();
