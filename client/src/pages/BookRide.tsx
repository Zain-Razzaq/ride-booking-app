import React, { useState, useEffect } from "react";
import { MapPin, Car, Bike, Truck, ArrowRight, Loader2 } from "lucide-react";
import { Layout } from "../components/Layout";

interface Location {
  id: number;
  name: string;
  address: string;
}

const rideTypes = [
  { id: "bike", name: "Bike", icon: Bike, price: "$5-10", time: "5-10 min" },
  { id: "car", name: "Car", icon: Car, price: "$10-25", time: "10-15 min" },
  {
    id: "ricksha",
    name: "Ricksha",
    icon: Truck,
    price: "$3-8",
    time: "8-12 min",
  },
];

export const BookRide: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [rideType, setRideType] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/locations");
      const data = await response.json();

      if (data.success) {
        setLocations(data.data);
      } else {
        console.error("Failed to fetch locations:", data.message);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookRide = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentLocation || !destination || !rideType) {
      alert("Please fill in all fields");
      return;
    }

    if (currentLocation === destination) {
      alert("Current location and destination cannot be the same");
      return;
    }

    setIsBooking(true);

    try {
      // Get location names
      const fromLocation = locations.find(
        (l) => l.id.toString() === currentLocation
      );
      const toLocation = locations.find((l) => l.id.toString() === destination);

      if (!fromLocation || !toLocation) {
        alert("Invalid location selection");
        setIsBooking(false);
        return;
      }

      // Import tripApi dynamically to avoid circular dependencies
      const { tripApi } = await import("@/lib/api");

      const tripData = {
        fromLocationId: parseInt(currentLocation),
        toLocationId: parseInt(destination),
        fromLocationName: fromLocation.name,
        toLocationName: toLocation.name,
        rideType: rideType as "bike" | "car" | "ricksha",
      };

      const response = await tripApi.bookTrip(tripData);

      if (response.success) {
        alert("Ride booked successfully! A driver will be assigned shortly.");
        // Reset form
        setCurrentLocation("");
        setDestination("");
        setRideType("");
      } else {
        alert("Failed to book ride: " + response.message);
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("Failed to book ride. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-gray-600">Loading locations...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Book a Ride
              </h1>
              <p className="text-gray-600">
                Choose your pickup and destination
              </p>
            </div>

            <form onSubmit={handleBookRide} className="space-y-6">
              {/* Current Location */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <MapPin className="inline h-4 w-4 mr-2 text-green-600" />
                  Current Location
                </label>
                <select
                  value={currentLocation}
                  onChange={(e) => setCurrentLocation(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  required
                >
                  <option value="">Select your current location</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name} - {location.address}
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <MapPin className="inline h-4 w-4 mr-2 text-red-600" />
                  Destination
                </label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  required
                >
                  <option value="">Select your destination</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name} - {location.address}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ride Type */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Choose Ride Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {rideTypes.map((ride) => {
                    const IconComponent = ride.icon;
                    return (
                      <div
                        key={ride.id}
                        className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          rideType === ride.id
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setRideType(ride.id)}
                      >
                        <input
                          type="radio"
                          name="rideType"
                          value={ride.id}
                          checked={rideType === ride.id}
                          onChange={() => setRideType(ride.id)}
                          className="sr-only"
                        />
                        <div className="text-center space-y-2">
                          <IconComponent
                            className={`h-8 w-8 mx-auto ${
                              rideType === ride.id
                                ? "text-primary"
                                : "text-gray-400"
                            }`}
                          />
                          <h3 className="font-medium text-gray-900">
                            {ride.name}
                          </h3>
                          <p className="text-sm text-gray-600">{ride.price}</p>
                          <p className="text-xs text-gray-500">{ride.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Journey Summary */}
              {currentLocation && destination && rideType && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Journey Summary
                  </h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">From:</span>
                    <span className="font-medium">
                      {
                        locations.find(
                          (l) => l.id.toString() === currentLocation
                        )?.name
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-center">
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">To:</span>
                    <span className="font-medium">
                      {
                        locations.find((l) => l.id.toString() === destination)
                          ?.name
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Ride Type:</span>
                    <span className="font-medium capitalize">{rideType}</span>
                  </div>
                </div>
              )}

              {/* Book Button */}
              <button
                type="submit"
                disabled={
                  isBooking || !currentLocation || !destination || !rideType
                }
                className="w-full bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isBooking ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Booking Ride...</span>
                  </>
                ) : (
                  <span>Book Ride</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};
