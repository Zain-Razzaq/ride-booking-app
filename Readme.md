# Ride Booking App

A full-stack ride booking application with distance-based pricing, real-time trip management, and user authentication.

## Main Features

- **User Authentication** - JWT-based login/signup for passengers and drivers
- **Distance-Based Pricing** - Dynamic fare calculation based on pickup/drop locations
- **Trip Management** - Book rides, accept driver requests, track trip status
- **Real-Time Updates** - Live price calculation and trip status updates
- **Multi-Vehicle Support** - Bike, Car, and Ricksha with different pricing tiers
- **Driver Dashboard** - Accept/decline trip requests, update trip status
- **Trip History** - View past rides with fare details

## Tech Stack

- **Frontend:** React.js with TypeScript, Tailwind CSS for styling
- **Backend:** Node.js with Express.js for REST API
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT tokens for secure user sessions

**Why MERN?** Chosen because I have experience with this stack and it provides a cohesive JavaScript ecosystem for rapid development.

## Key Assumptions

- **Currency:** All pricing is in PKR (Pakistani Rupees) assuming Pakistan market
- **Locations:** Pre-defined locations in Lahore with fixed distance matrix
- **User Roles:** Simple passenger/driver distinction without complex role management
- **Pricing Model:** Fixed base price + per-km rate for each vehicle type

## Data Model

```
User
├── _id (ObjectId)
├── name (String)
├── email (String, unique)
├── password (String, hashed)
└── role (String: 'passenger' | 'driver')

Trip
├── _id (ObjectId)
├── userId (ObjectId, ref: User)
├── driverId (ObjectId, ref: User)
├── fromLocation (String)
├── toLocation (String)
├── rideType (String: 'bike' | 'car' | 'ricksha')
├── fare (Number)
├── status (String: 'pending' | 'accepted' | 'in_progress' | 'completed')
└── createdAt (Date)

Location
├── _id (ObjectId)
├── name (String)
├── address (String)
└── distances (Map<String, Number>)

```

## Setup Instructions

1. **Clone the repository**
2. **Install dependencies:**

   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   ```

3. **Environment Variables:**
   Create `.env` file in server directory:

   ```
   MONGODB_URI=
   JWT_SECRET=
   PORT=
   ```


## Running the App
**Client**
```bash
cd client 
npm run dev
```
**Server**
```bash
cd server 
npm start
```
**Default URLs:**

- Backend: `http://localhost:5173`
- Frontend: `http://localhost:8000`
