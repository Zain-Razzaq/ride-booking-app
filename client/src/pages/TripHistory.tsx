import React, { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import {
  MapPin,
  Calendar,
  Clock,
  Car,
  Bike,
  Truck,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { tripApi, type Trip } from "@/lib/api";

const getRideIcon = (rideType: string) => {
  switch (rideType) {
    case "car":
      return Car;
    case "bike":
      return Bike;
    case "ricksha":
      return Truck;
    default:
      return Car;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "text-green-600 bg-green-100";
    case "cancelled":
      return "text-red-600 bg-red-100";
    case "in_progress":
      return "text-blue-600 bg-blue-100";
    case "accepted":
      return "text-yellow-600 bg-yellow-100";
    case "pending":
      return "text-gray-600 bg-gray-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

const formatStatus = (status: string) => {
  switch (status) {
    case "in_progress":
      return "In Progress";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

export const TripHistory: React.FC = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrips();
  }, [user]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (user?.role === "driver") {
        response = await tripApi.getDriverTrips();
      } else {
        response = await tripApi.getUserTrips();
      }

      if (response.success) {
        setTrips(response.trips);
      } else {
        setError(response.message);
      }
    } catch (error) {
      console.error("Error fetching trips:", error);
      setError("Failed to load trip history");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-gray-600">Loading trip history...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Trip History
              </h1>
              <p className="text-gray-600">
                {user?.role === "driver"
                  ? "View your completed rides and earnings"
                  : "View your past rides and bookings"}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {trips.map((trip) => {
                const RideIcon = getRideIcon(trip.rideType);
                const statusColor = getStatusColor(trip.status);
                return (
                  <div
                    key={trip._id}
                    className="bg-white rounded-lg shadow p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-full ${statusColor}`}>
                          <RideIcon className="h-6 w-6" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-green-600" />
                            <span className="font-medium">
                              {trip.fromLocationName}
                            </span>
                            <span className="text-gray-400">→</span>
                            <MapPin className="h-4 w-4 text-red-600" />
                            <span className="font-medium">
                              {trip.toLocationName}
                            </span>
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(trip.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                {new Date(trip.createdAt).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            </div>
                            <span className="capitalize font-medium">
                              {trip.rideType}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          ${trip.fare}
                        </div>
                        <div
                          className={`text-sm font-medium ${
                            statusColor.split(" ")[0]
                          }`}
                        >
                          {formatStatus(trip.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {trips.length === 0 && !loading && !error && (
              <div className="text-center py-12">
                <div className="bg-white rounded-lg shadow p-8">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No trips yet
                  </h3>
                  <p className="text-gray-600">
                    {user?.role === "driver"
                      ? "Your trip history will appear here once you start accepting rides."
                      : "Your trip history will appear here once you start booking rides."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
