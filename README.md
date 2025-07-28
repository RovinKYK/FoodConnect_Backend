# FoodConnect Backend - Node.js/Express API

This repository contains the backend API for the FoodConnect platform, a community food sharing application. It handles user authentication, food item management, requests, notifications, and integrates with PostgreSQL and Firebase Storage.

## Overview
The FoodConnect backend serves as the core logic provider for the platform. It exposes a RESTful API for the frontend application, managing data persistence, business rules, and external service integrations.

## Architecture
- **Framework:** Node.js with Express.js
- **Database:** PostgreSQL
- **ORM:** Sequelize
- **Authentication:** Choreo managed login
- **File Storage:** Firebase Storage for image uploads

## Features
- User authentication (login, signup, current user retrieval)
- User profile management
- CRUD operations for food items (create, read, update, delete)
- Food item search and filtering capabilities
- System for making and managing food requests
- Real-time notification handling
- Secure image upload integration with Firebase Storage
- Robust form validation and error handling
- Database migrations and seeding capabilities

## Quick Start
### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd FoodConnect/backend
```

### 2. Backend Setup
Navigate into the backend directory and install dependencies:
```bash
npm install
```

### 3. Configuration
Create a `config.json` file in the `backend/config/` directory by copying the example below:
```json
{
  "development": {
    "username": "postgres",
    "password": "your_password",
    "database": "foodconnect_dev",
    "host": "127.0.0.1",
    "port": 5432,
    "dialect": "postgres",
    "logging": false,
    "JWT_SECRET": "your-super-secret-jwt-key",
    "FIREBASE_PROJECT_ID": "your-firebase-project-id",
    "FIREBASE_CLIENT_EMAIL": "your-firebase-client-email",
    "FIREBASE_PRIVATE_KEY": "your-firebase-private-key-with-escaped-newlines",
    "FIREBASE_STORAGE_BUCKET": "your-firebase-storage-bucket",
    "CHOREO_CLIENT_ID": "your-choreo-client-id",
    "CHOREO_CLIENT_SECRET": "your-choreo-client-secret",
    "CHOREO_REDIRECT_URI": "your-choreo-redirect-uri"
  },
  "test": {
    "username": "postgres",
    "password": "your_password",
    "database": "foodconnect_test",
    "host": "127.0.0.1",
    "port": 5432,
    "dialect": "postgres",
    "logging": false
  },
  "production": {
    "username": "postgres",
    "password": "your_password",
    "database": "foodconnect_prod",
    "host": "127.0.0.1",
    "port": 5432,
    "dialect": "postgres",
    "logging": false
  }
}
```
Edit the newly created `config.json` file with your specific credentials and configurations.

### 4. Database Setup
Ensure your PostgreSQL server is running locally (e.g., via `brew services start postgresql` on macOS).

Create the development database:
```bash
createdb foodconnect_dev
```
The backend is configured to automatically sync tables in development mode when the server starts, so explicit migrations might not be needed initially, but are available for controlled schema changes.

### 5. Start the Backend Server
```bash
npm run dev
```
The server will typically run on http://localhost:5001.

## Project Structure
```
backend/
├── src/
│   ├── controllers/     # Route handlers for API endpoints
│   ├── middleware/      # Custom Express middleware (e.g., authentication, error handling)
│   ├── models/          # Sequelize ORM definitions for database tables
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic and interactions with models/external services
│   └── app.js           # Main Express application entry point
├── config/              # Database connection and Sequelize configuration
├── package.json         # Project dependencies and scripts
└── README.md            # This documentation
```

## Database Schema
### Users Table
- id (UUID, Primary Key)
- choreo_user_id (String, Unique)
- first_name (String)
- last_name (String)
- address (String)
- phone_number (String)
- created_at (Timestamp)
- updated_at (Timestamp)

### FoodItems Table
- id (UUID, Primary Key)
- donor_id (UUID, Foreign Key to Users.id)
- food_type (String)
- quantity_available (Decimal)
- quantity_unit (Enum: 'count', 'grams')
- prepared_date (Date)
- prepared_time (Time)
- description (Text)
- image_url (Text) - URL to the image stored in Firebase Storage
- created_at (Timestamp)
- updated_at (Timestamp)

### FoodRequests Table
- id (UUID, Primary Key)
- food_item_id (UUID, Foreign Key to FoodItems.id)
- requester_id (UUID, Foreign Key to Users.id)
- requested_amount (Decimal)
- request_date (Timestamp)
- status (Enum: 'pending', 'accepted', 'completed', 'cancelled')

### Notifications Table
- id (UUID, Primary Key)
- recipient_user_id (UUID, Foreign Key to Users.id)
- sender_user_id (UUID, Foreign Key to Users.id, nullable)
- food_item_id (UUID, Foreign Key to FoodItems.id, nullable)
- requested_amount (Decimal, nullable)
- message (Text)
- is_read (Boolean, default: false)
- created_at (Timestamp)

## Development
- Start development server:
  ```bash
  npm run dev
  ```
- Run database migrations:
  ```bash
  npm run db:migrate
  ```
- Run database seeders:
  ```bash
  npm run db:seed
  ```
- Reset database (DANGER: Deletes all data!):
  ```bash
  npm run db:reset
  ```

## API Endpoints
All API endpoints are prefixed with `/api`.

### Authentication
- `POST /api/auth/login` - Authenticates a user.
- `POST /api/auth/signup` - Registers a new user.
- `GET /api/auth/user` - Retrieves the currently authenticated user's details.

### User Management
- `POST /api/user/profile` - Updates the profile of the authenticated user.
- `GET /api/user/profile` - Retrieves the profile of the authenticated user.

### Food Management
- `POST /api/food` - Creates a new food item listing.
- `GET /api/food` - Retrieves all food items, with optional search and filtering.
- `GET /api/food/:id` - Retrieves a specific food item by its ID.
- `GET /api/food/myfoods` - Retrieves food items donated by the authenticated user.
- `PUT /api/food/:id` - Updates a specific food item by its ID.
- `DELETE /api/food/:id` - Deletes a specific food item by its ID.
- `POST /api/food/:id/request` - Submits a request for a specific food item.

### Notifications
- `GET /api/notifications` - Retrieves notifications for the authenticated user.
- `PUT /api/notifications/:id/read` - Marks a specific notification as read.
- `PUT /api/notifications/read-all` - Marks all notifications for the user as read.

### File Upload
- `POST /api/upload/image` - Handles image uploads to Firebase Storage.

## Testing
To run backend tests:
```bash
npm test
```

## Deployment
- Set production environment variables: Ensure all necessary environment variables (database, JWT secret, Firebase, Choreo) are configured for your production environment.
- Build the application:
  ```bash
  npm run build
  ```
- Deploy: Deploy the built application to your preferred platform (e.g., Heroku, AWS EC2, Google Cloud Run, etc.).

## Contributing
We welcome contributions to the FoodConnect backend! Please follow these guidelines:
- Fork the repository.
- Create a new feature branch (`git checkout -b feature/your-feature-name`).
- Make your changes.
- Add tests for new or changed functionality.
- Ensure your code adheres to existing code style and patterns.
- Submit a pull request with a clear description of your changes.

### Code Style
- Follow existing code patterns.
- Use meaningful variable and function names.
- Add comments for complex logic.
- Maintain consistent formatting.

## License
This project is licensed under the ISC License.

## Support
For support and questions regarding the backend:
- Review the code in the `src/` directory.
- Check the API endpoint documentation above.
- Monitor your server console for error messages.

## Future Enhancements
- Integration of real-time chat functionality.
- Advanced analytics and reporting for food donations/requests.
- More sophisticated notification types and delivery mechanisms.
- Enhanced security features and logging.

_Built with ❤️ for community food sharing_
