import React, { useState, useEffect } from "react";
import { MapPin, Car, Bike, Truck, ArrowRight, Loader2 } from "lucide-react";
import { Layout } from "../components/Layout";
import toast from "react-hot-toast";

/**
 * BookRide component - Trip booking form with real-time price calculation
 */

interface Location {
  id: number;
  name: string;
  address: string;
}

interface PriceData {
  distance: number;
  basePrice: number;
  distancePrice: number;
  totalPrice: number;
  rideType: string;
}

const rideTypes = [
  {
    id: "bike",
    name: "Bike",
    icon: Bike,
    time: "5-10 min",
  },
  {
    id: "car",
    name: "Car",
    icon: Car,
    time: "10-15 min",
  },
  {
    id: "ricksha",
    name: "Ricksha",
    icon: Truck,
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
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [calculatingPrice, setCalculatingPrice] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  // Calculate price when all fields are selected
  useEffect(() => {
    if (currentLocation && destination && rideType) {
      calculatePrice();
    } else {
      setPriceData(null);
    }
  }, [currentLocation, destination, rideType]);

  const fetchLocations = async () => {
    try {
      // Import locationApi dynamically to avoid circular dependencies
      const { locationApi } = await import("@/lib/api");
      const response = await locationApi.getLocations();

      if (response.success) {
        setLocations(response.data);
      } else {
        console.error("Failed to fetch locations:", response.message);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = async () => {
    try {
      setCalculatingPrice(true);
      const { locationApi } = await import("@/lib/api");

      const response = await locationApi.calculatePrice(
        parseInt(currentLocation),
        parseInt(destination),
        rideType
      );

      if (response.success) {
        setPriceData(response.data);
      } else {
        console.error("Failed to calculate price:", response.message);
      }
    } catch (error) {
      console.error("Error calculating price:", error);
    } finally {
      setCalculatingPrice(false);
    }
  };

  const handleBookRide = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentLocation || !destination || !rideType) {
      toast.error("Please fill in all fields");
      return;
    }

    if (currentLocation === destination) {
      toast.error("Current location and destination cannot be the same");
      return;
    }

    setIsBooking(true);

    try {
      // Import tripApi dynamically to avoid circular dependencies
      const { tripApi } = await import("@/lib/api");

      const tripData = {
        fromLocationId: parseInt(currentLocation),
        toLocationId: parseInt(destination),
        rideType: rideType as "bike" | "car" | "ricksha",
      };

      const response = await tripApi.bookTrip(tripData);

      if (response.success) {
        toast.success(
          "Ride booked successfully! A driver will be assigned shortly."
        );
        // Reset form
        setCurrentLocation("");
        setDestination("");
        setRideType("");
      } else {
        toast.error("Failed to book ride: " + response.message);
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to book ride. Please try again.");
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
                  onChange={(e) => {
                    setCurrentLocation(e.target.value);
                    // Clear destination if it's the same as new current location
                    if (destination === e.target.value) {
                      setDestination("");
                    }
                  }}
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
                  onChange={(e) => {
                    setDestination(e.target.value);
                    // Clear current location if it's the same as new destination
                    if (currentLocation === e.target.value) {
                      setCurrentLocation("");
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  required
                >
                  <option value="">Select your destination</option>
                  {locations.map((location) => (
                    <option
                      key={location.id}
                      value={location.id}
                      disabled={currentLocation === location.id.toString()}
                      className={
                        currentLocation === location.id.toString()
                          ? "text-gray-400"
                          : ""
                      }
                    >
                      {location.name} - {location.address}
                      {currentLocation === location.id.toString()
                        ? " (Current Location)"
                        : ""}
                    </option>
                  ))}
                </select>
                {currentLocation && (
                  <p className="text-xs text-gray-500">
                    Note: You cannot select the same location as your current
                    location
                  </p>
                )}
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

              {/* Price Calculation */}
              {currentLocation && destination && rideType && (
                <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Trip Details & Pricing
                  </h3>

                  {calculatingPrice ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-2" />
                      <span className="text-sm text-gray-600">
                        Calculating price...
                      </span>
                    </div>
                  ) : priceData ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Distance:</span>
                        <span className="font-medium">
                          {priceData.distance} km
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Base Fare:</span>
                        <span className="font-medium">
                          PKR {priceData.basePrice}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Distance Charge:</span>
                        <span className="font-medium">
                          PKR {priceData.distancePrice}
                        </span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900">
                            Total Fare:
                          </span>
                          <span className="font-bold text-lg text-green-600">
                            PKR {priceData.totalPrice}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : null}
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
