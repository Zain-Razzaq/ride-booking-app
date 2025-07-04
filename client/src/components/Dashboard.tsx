import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { User, Car, LogOut } from "lucide-react";

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">RideShare</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {user?.role === "driver" ? (
                  <Car className="h-5 w-5 text-primary" />
                ) : (
                  <User className="h-5 w-5 text-primary" />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {user?.name}
                </span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full capitalize">
                  {user?.role}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-1"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                ? "Start accepting ride requests and earn money"
                : "Book rides and travel safely"}
            </p>
            <Button className="w-full">
              {user?.role === "driver" ? "Go Online" : "Book a Ride"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="font-semibold text-gray-900 mb-2">Profile</h4>
              <p className="text-sm text-gray-600">
                Manage your account settings
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="font-semibold text-gray-900 mb-2">
                {user?.role === "driver" ? "Earnings" : "Trip History"}
              </h4>
              <p className="text-sm text-gray-600">
                {user?.role === "driver"
                  ? "View your earnings and payouts"
                  : "View your past trips"}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="font-semibold text-gray-900 mb-2">Support</h4>
              <p className="text-sm text-gray-600">Get help when you need it</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
