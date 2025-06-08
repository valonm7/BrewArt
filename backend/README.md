# BrewArt Backend

This is the Express and MongoDB backend for BrewArt, a coffee shop ordering application.

## Setup

1. Create a `.env` file in the backend directory with the following keys:
```
PORT=5001
JWT_SECRET=your_jwt_secret_here_please_change_in_production
MONGODB_URI=mongodb://localhost:27017/brewart
```

2. Install dependencies:
```
cd backend
npm install
```

## Running the Backend

Development mode with auto-restart:
```
npm run dev
```

Production mode:
```
npm start
```

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login a user
- `POST /api/users/guest` - Continue as guest
- `GET /api/users/profile` - Get user profile (authenticated)
- `PUT /api/users/profile` - Update user profile (authenticated)
- `PUT /api/users/points` - Update user points (authenticated)

## Models

### User
- name: String (required)
- email: String (required, unique)
- password: String (required, hashed)
- points: Number
- birthday: String
- isGuest: Boolean
- role: String (customer/admin)

### MenuItem
- name: String (required)
- description: String (required)
- price: Number (required)
- imageUrl: String (required)
- category: String (required)
- available: Boolean (default: true)

### Order
- user: ObjectId reference to User
- tableId: String (required)
- items: Array of OrderItems
- totalPrice: Number (required)
- status: String (pending/in-progress/ready/delivered/cancelled)
- paymentMethod: String (cash/card/gift-card)
- pointsEarned: Number
- pointsUsed: Number
- specialInstructions: String

### GiftCard
- code: String (required, unique)
- amount: Number (required)
- balanceRemaining: Number (required)
- isActive: Boolean (default: true)
- expiresAt: Date
- createdBy: ObjectId reference to User (optional)
- redeemedBy: ObjectId reference to User (optional)
- redemptionDate: Date (optional) 