import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import {
  User,
  Car,
  MapPin,
  Calendar,
  Clock,
  Bike,
  Truck,
  ArrowRight,
  UserCheck,
  Navigation,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Layout } from "./Layout";
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
      return "text-green-600";
    case "cancelled":
      return "text-red-600";
    case "in_progress":
      return "text-blue-600";
    case "accepted":
      return "text-yellow-600";
    case "pending":
      return "text-gray-600";
    default:
      return "text-gray-600";
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

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [activeTrips, setActiveTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentTrips();
    fetchActiveTrips();
  }, [user]);

  const fetchRecentTrips = async () => {
    try {
      setLoading(true);
      let response;
      if (user?.role === "driver") {
        response = await tripApi.getDriverTrips();
      } else {
        response = await tripApi.getUserTrips();
      }

      if (response.success) {
        setRecentTrips(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching recent trips:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveTrips = async () => {
    try {
      const response = await tripApi.getActiveTrips();
      if (response.success) {
        setActiveTrips(response.data || []);
      } else {
        console.error("Error fetching active trips:", response.message);
      }
    } catch (error) {
      console.error("Error fetching active trips:", error);
    }
  };

  const handleStatusUpdate = async (tripId: string, newStatus: string) => {
    try {
      setUpdatingStatus(tripId);
      const response = await tripApi.updateTripStatus(tripId, newStatus);

      if (response.success) {
        // Update the active trips list
        setActiveTrips((prev) =>
          prev
            .map((trip) =>
              trip._id === tripId
                ? { ...trip, status: newStatus as Trip["status"] }
                : trip
            )
            .filter(
              (trip) =>
                // Remove from active if completed or cancelled
                !["completed", "cancelled"].includes(trip.status)
            )
        );
      } else {
        toast.error("Failed to update trip status: " + response.message);
      }
    } catch (error) {
      console.error("Error updating trip status:", error);
      toast.error("Failed to update trip status. Please try again.");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleBookRide = () => {
    navigate("/book-ride");
  };

  const renderActiveTrip = (trip: Trip) => {
    const RideIcon = getRideIcon(trip.rideType);
    const statusColor = getStatusColor(trip.status);
    const isDriver = user?.role === "driver";
    const isUpdating = updatingStatus === trip._id;

    return (
      <div
        key={trip._id}
        className="border-l-4 border-blue-500 bg-blue-50 rounded-lg p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className="p-2 bg-blue-100 rounded-full">
              <RideIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 text-sm mb-1">
                <MapPin className="h-3 w-3 text-green-600" />
                <span className="font-medium">{trip.fromLocationName}</span>
                <span className="text-gray-400">→</span>
                <MapPin className="h-3 w-3 text-red-600" />
                <span className="font-medium">{trip.toLocationName}</span>
              </div>

              {/* Driver/Passenger Info */}
              {isDriver && trip.passenger && (
                <div className="flex items-center space-x-1 text-xs text-gray-600 mb-1">
                  <User className="h-3 w-3" />
                  <span>Passenger: {trip.passenger.name}</span>
                </div>
              )}

              {!isDriver && trip.driver && (
                <div className="flex items-center space-x-1 text-xs text-gray-600 mb-1">
                  <UserCheck className="h-3 w-3" />
                  <span>Driver: {trip.driver.name}</span>
                </div>
              )}

              <div className="flex items-center space-x-2 text-xs">
                <span className={`font-medium ${statusColor}`}>
                  {formatStatus(trip.status)}
                </span>
                <span>•</span>
                <span className="text-gray-500">PKR {trip.fare}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons for Drivers */}
          {isDriver && (
            <div className="flex space-x-2">
              {trip.status === "accepted" && (
                <Button
                  size="sm"
                  onClick={() => handleStatusUpdate(trip._id, "in_progress")}
                  disabled={isUpdating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isUpdating ? "Starting..." : "Start Trip"}
                </Button>
              )}
              {trip.status === "in_progress" && (
                <Button
                  size="sm"
                  onClick={() => handleStatusUpdate(trip._id, "completed")}
                  disabled={isUpdating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isUpdating ? "Completing..." : "Complete Trip"}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">
                Welcome, {user?.name}!
              </h2>
              <p className="text-gray-600">
                You're logged in as a{" "}
                {user?.role === "driver" ? "Driver" : "Passenger"}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-8 max-w-md mx-auto">
              <div className="flex items-center justify-center mb-4">
                {user?.role === "driver" ? (
                  <Car className="h-12 w-12 text-primary" />
                ) : (
                  <User className="h-12 w-12 text-primary" />
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {user?.role === "driver"
                  ? "Driver Dashboard"
                  : "Passenger Dashboard"}
              </h3>
              <p className="text-gray-600 mb-6">
                {user?.role === "driver"
                  ? "Accept ride requests and manage your trips"
                  : "Book rides and track your journeys"}
              </p>
              <Button
                className="w-full"
                onClick={
                  user?.role === "driver"
                    ? () => navigate("/driver-requests")
                    : handleBookRide
                }
              >
                {user?.role === "driver" ? "View Requests" : "Book a Ride"}
              </Button>
            </div>
          </div>

          {/* Active Trips Section */}
          {activeTrips.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Active {user?.role === "driver" ? "Rides" : "Trips"}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Navigation className="h-4 w-4" />
                  <span>Live Updates</span>
                </div>
              </div>

              <div className="space-y-4">
                {activeTrips.map(renderActiveTrip)}
              </div>
            </div>
          )}

          {/* Recent Trips Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Recent {user?.role === "driver" ? "Rides" : "Trips"}
              </h3>
              <Button
                variant="outline"
                onClick={() => navigate("/trip-history")}
                className="flex items-center space-x-2"
              >
                <span>View All</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading recent trips...</p>
              </div>
            ) : recentTrips.length > 0 ? (
              <div className="space-y-4">
                {recentTrips.map((trip) => {
                  const RideIcon = getRideIcon(trip.rideType);
                  const statusColor = getStatusColor(trip.status);
                  return (
                    <div
                      key={trip._id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-100 rounded-full">
                            <RideIcon className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 text-sm">
                              <MapPin className="h-3 w-3 text-green-600" />
                              <span className="font-medium">
                                {trip.fromLocationName}
                              </span>
                              <span className="text-gray-400">→</span>
                              <MapPin className="h-3 w-3 text-red-600" />
                              <span className="font-medium">
                                {trip.toLocationName}
                              </span>
                            </div>
                            <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {new Date(
                                    trip.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
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
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">
                            PKR {trip.fare}
                          </div>
                          <div className={`text-xs font-medium ${statusColor}`}>
                            {formatStatus(trip.status)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  No trips yet
                </h4>
                <p className="text-gray-600 mb-4">
                  {user?.role === "driver"
                    ? "Start accepting ride requests to see them here"
                    : "Book your first ride to see your trip history"}
                </p>
                {user?.role !== "driver" && (
                  <Button onClick={handleBookRide}>Book Your First Ride</Button>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="font-semibold text-gray-900 mb-2">Profile</h4>
              <p className="text-sm text-gray-600">
                Manage your account settings
              </p>
            </div>
            <div
              className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate("/trip-history")}
            >
              <h4 className="font-semibold text-gray-900 mb-2">
                {user?.role === "driver" ? "All Rides" : "Trip History"}
              </h4>
              <p className="text-sm text-gray-600">
                {user?.role === "driver"
                  ? "View all your completed rides"
                  : "View your complete trip history"}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="font-semibold text-gray-900 mb-2">Support</h4>
              <p className="text-sm text-gray-600">Get help when you need it</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
