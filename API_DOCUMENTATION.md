# API Documentation

## Authentication

All protected routes require JWT token in cookies (`userToken`).

---

## Authentication Endpoints

### Register User

- **POST** `/api/auth/register`
- **Description**: Create new user account
- **Body**:
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string",
    "role": "user" | "driver"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "user": {
      "_id": "string",
      "name": "string",
      "email": "string",
      "role": "string"
    }
  }
  ```

### Login User

- **POST** `/api/auth/login`
- **Description**: Authenticate user and create session
- **Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "user": {
      "_id": "string",
      "name": "string",
      "email": "string",
      "role": "string"
    }
  }
  ```

### Logout User

- **POST** `/api/auth/logout`
- **Description**: Clear user session
- **Response**:
  ```json
  {
    "success": true,
    "message": "Logout successful"
  }
  ```

### Get User Profile

- **GET** `/api/auth/profile`
- **Description**: Get current user profile
- **Response**:
  ```json
  {
    "success": true,
    "user": {
      "_id": "string",
      "name": "string",
      "email": "string",
      "role": "string"
    }
  }
  ```

---

## Location Endpoints

### Get All Locations

- **GET** `/api/locations`
- **Description**: Retrieve all available pickup/drop locations
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "string",
        "name": "string",
        "address": "string",
        "distances": {
          "1": 5.5,
          "2": 10.2
        }
      }
    ]
  }
  ```

### Calculate Trip Price

- **GET** `/api/locations/calculate-price`
- **Description**: Calculate trip fare based on distance and vehicle type
- **Query Parameters**:
  - `fromLocationId`: string (required)
  - `toLocationId`: string (required)
  - `rideType`: "bike" | "car" | "ricksha" (required)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "distance": 15.5,
      "basePrice": 100,
      "perKmRate": 25,
      "totalPrice": 487.5,
      "rideType": "car"
    }
  }
  ```

---

## Trip Endpoints

### Book Trip

- **POST** `/api/trips/book`
- **Description**: Create new trip booking
- **Body**:
  ```json
  {
    "fromLocationId": "string",
    "toLocationId": "string",
    "rideType": "bike" | "car" | "ricksha"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "string",
      "userId": "string",
      "fromLocationId": "string",
      "toLocationId": "string",
      "rideType": "string",
      "fare": 487.5,
      "status": "pending",
      "createdAt": "string"
    }
  }
  ```

### Get User Trips

- **GET** `/api/trips/user`
- **Description**: Retrieve user's trip history
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "string",
        "fromLocationName": "string",
        "toLocationName": "string",
        "rideType": "string",
        "fare": 487.5,
        "status": "completed",
        "createdAt": "string",
        "driver": {
          "name": "string",
          "email": "string"
        }
      }
    ]
  }
  ```

### Get Driver Trips

- **GET** `/api/trips/driver`
- **Description**: Retrieve driver's trip history
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "string",
        "fromLocationName": "string",
        "toLocationName": "string",
        "rideType": "string",
        "fare": 487.5,
        "status": "completed",
        "createdAt": "string",
        "passenger": {
          "name": "string",
          "email": "string"
        }
      }
    ]
  }
  ```

### Get Pending Trips

- **GET** `/api/trips/pending`
- **Description**: Retrieve trips awaiting driver acceptance
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "string",
        "fromLocationName": "string",
        "toLocationName": "string",
        "rideType": "string",
        "fare": 487.5,
        "status": "pending",
        "createdAt": "string",
        "passenger": {
          "name": "string",
          "email": "string"
        }
      }
    ]
  }
  ```

### Get Active Trips

- **GET** `/api/trips/active`
- **Description**: Retrieve currently active trips
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "string",
        "fromLocationName": "string",
        "toLocationName": "string",
        "rideType": "string",
        "fare": 487.5,
        "status": "in_progress",
        "createdAt": "string"
      }
    ]
  }
  ```

### Accept Trip

- **PATCH** `/api/trips/:tripId/accept`
- **Description**: Driver accepts a trip request
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "string",
      "status": "accepted",
      "driverId": "string"
    }
  }
  ```

### Update Trip Status

- **PATCH** `/api/trips/:tripId/status`
- **Description**: Update trip status
- **Body**:
  ```json
  {
    "status": "in_progress" | "completed" | "cancelled"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "string",
      "status": "completed"
    }
  }
  ```

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```
