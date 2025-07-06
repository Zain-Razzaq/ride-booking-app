import React, { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import toast from "react-hot-toast";
import {
  MapPin,
  Calendar,
  Clock,
  Car,
  Bike,
  Truck,
  Loader2,
  User,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { tripApi, type Trip } from "@/lib/api";
import { Button } from "@/components/ui/button";

/**
 * DriverRequests component - Shows pending trip requests for drivers to accept
 */

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

export const DriverRequests: React.FC = () => {
  const { user } = useAuth();
  const [pendingTrips, setPendingTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingTrips();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchPendingTrips, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingTrips = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await tripApi.getPendingTrips();

      if (response.success) {
        setPendingTrips(response.data || []);
      } else {
        setError(response.message);
      }
    } catch (error) {
      console.error("Error fetching pending trips:", error);
      setError("Failed to load trip requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTrip = async (tripId: string) => {
    try {
      setAccepting(tripId);
      const response = await tripApi.acceptTrip(tripId);

      if (response.success) {
        // Remove the trip from pending list
        setPendingTrips((prev) => prev.filter((trip) => trip._id !== tripId));
        toast.success(
          "Trip accepted successfully! You can now start the ride."
        );
      } else {
        toast.error("Failed to accept trip: " + response.message);
      }
    } catch (error) {
      console.error("Error accepting trip:", error);
      toast.error("Failed to accept trip. Please try again.");
    } finally {
      setAccepting(null);
    }
  };

  if (user?.role !== "driver") {
    return (
      <Layout>
        <div className="py-8">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Access Denied
            </h1>
            <p className="text-gray-600">
              This page is only accessible to drivers.
            </p>
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Trip Requests
                </h1>
                <p className="text-gray-600">
                  Accept ride requests from passengers
                </p>
              </div>
              <Button
                onClick={fetchPendingTrips}
                disabled={loading}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                <span>Refresh</span>
              </Button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {loading && pendingTrips.length === 0 ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
                <p className="text-gray-600">Loading trip requests...</p>
              </div>
            ) : pendingTrips.length > 0 ? (
              <div className="space-y-4">
                {pendingTrips.map((trip) => {
                  const RideIcon = getRideIcon(trip.rideType);
                  const isAccepting = accepting === trip._id;

                  return (
                    <div
                      key={trip._id}
                      className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="p-3 rounded-full bg-blue-100">
                            <RideIcon className="h-6 w-6 text-blue-600" />
                          </div>

                          <div className="space-y-2 flex-1">
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
                                  {new Date(
                                    trip.createdAt
                                  ).toLocaleDateString()}
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
                              <div className="flex items-center space-x-1">
                                <User className="h-4 w-4" />
                                <span className="capitalize font-medium">
                                  {trip.rideType} ride
                                </span>
                              </div>
                            </div>

                            <div className="text-xs text-gray-500">
                              Request ID: {trip._id}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                              PKR {trip.fare}
                            </div>
                            <div className="text-sm text-gray-500">
                              Estimated fare
                            </div>
                          </div>

                          <Button
                            onClick={() => handleAcceptTrip(trip._id)}
                            disabled={isAccepting}
                            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                          >
                            {isAccepting ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Accepting...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4" />
                                <span>Accept</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-white rounded-lg shadow p-8">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No trip requests available
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Check back later for new ride requests from passengers.
                  </p>
                  <Button onClick={fetchPendingTrips} variant="outline">
                    Refresh Requests
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
