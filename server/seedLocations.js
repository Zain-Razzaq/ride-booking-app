import mongoose from "mongoose";
import { createLocations, locationsExist } from "./database/locations.js";
import dotenv from "dotenv";
dotenv.config();

// Distance graph
const distanceMatrix = {
  1: { 2: 15, 3: 3, 4: 8, 5: 12, 6: 5, 7: 4, 8: 18, 9: 25, 10: 22 },
  2: { 1: 15, 3: 18, 4: 12, 5: 10, 6: 20, 7: 19, 8: 8, 9: 35, 10: 30 },
  3: { 1: 3, 2: 18, 4: 6, 5: 9, 6: 8, 7: 7, 8: 21, 9: 28, 10: 25 },
  4: { 1: 8, 2: 12, 3: 6, 5: 5, 6: 13, 7: 12, 8: 15, 9: 20, 10: 18 },
  5: { 1: 12, 2: 10, 3: 9, 4: 5, 6: 17, 7: 16, 8: 10, 9: 15, 10: 13 },
  6: { 1: 5, 2: 20, 3: 8, 4: 13, 5: 17, 7: 9, 8: 23, 9: 30, 10: 27 },
  7: { 1: 4, 2: 19, 3: 7, 4: 12, 5: 16, 6: 9, 8: 22, 9: 29, 10: 26 },
  8: { 1: 18, 2: 8, 3: 21, 4: 15, 5: 10, 6: 23, 7: 22, 9: 17, 10: 14 },
  9: { 1: 25, 2: 35, 3: 28, 4: 20, 5: 15, 6: 30, 7: 29, 8: 17, 10: 8 },
  10: { 1: 22, 2: 30, 3: 25, 4: 18, 5: 13, 6: 27, 7: 26, 8: 14, 9: 8 },
};

const locations = [
  {
    id: 1,
    name: "City Center",
    address: "Main Street, Downtown",
    distances: distanceMatrix[1],
  },
  {
    id: 2,
    name: "Airport",
    address: "Allama Iqbal International Airport",
    distances: distanceMatrix[2],
  },
  {
    id: 3,
    name: "Train Station",
    address: "Lahore Railway Station",
    distances: distanceMatrix[3],
  },
  {
    id: 4,
    name: "Emporium Mall",
    address: "Johar Town",
    distances: distanceMatrix[4],
  },
  {
    id: 5,
    name: "University",
    address: "University of Lahore",
    distances: distanceMatrix[5],
  },
  {
    id: 6,
    name: "Jinnah Hospital",
    address: "Johar Town",
    distances: distanceMatrix[6],
  },
  {
    id: 7,
    name: "Gadaffi Stadium",
    address: "Gadaffi Stadium",
    distances: distanceMatrix[7],
  },
  {
    id: 8,
    name: "Faisal Town",
    address: "Faisal Town",
    distances: distanceMatrix[8],
  },
  {
    id: 9,
    name: "DHA Raya",
    address: "DHA Raya",
    distances: distanceMatrix[9],
  },
  {
    id: 10,
    name: "Lake City",
    address: "Lake City",
    distances: distanceMatrix[10],
  },
];

const seedLocations = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI
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
      console.log("Locations with distance data seeded successfully");
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
