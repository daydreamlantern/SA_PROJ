# Employee Leave Request System

A full-stack web application for managing employee leave requests. Built with React for the frontend and Node.js/Express with MySQL for the backend.

## Features

- **User Authentication**: Employee signup and login functionality
- **Admin Dashboard**: View all leave requests and approve/deny them
- **Employee Dashboard**: Submit leave requests and view their status
- **Role-based Access**: Different views for admin and employee users
- **Secure Authentication**: JWT-based authentication system

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
2. **XAMPP** (for MySQL database) - [Download here](https://www.apachefriends.org/)
3. **Git** (optional) - [Download here](https://git-scm.com/)

## Step-by-Step Installation Guide

### Step 1: Install XAMPP and Start MySQL

1. Download and install XAMPP from the official website
2. Open XAMPP Control Panel
3. Start the **Apache** and **MySQL** services
4. Make sure both services are running (green status)

### Step 2: Create the Database

1. Open your web browser and go to `http://localhost/phpmyadmin`
2. Click on the **SQL** tab
3. Copy and paste the entire contents of `database.sql` file
4. Click **Go** to execute the SQL script
5. Verify that the database `employee_leave_db` has been created with two tables:
   - `users`
   - `leave_requests`

**Note:** If you already have an existing database, run the `database_migration.sql` script instead to add the date fields to your existing `leave_requests` table.

### Step 3: Install Backend Dependencies

1. Open a terminal/command prompt
2. Navigate to the project root directory:
   ```bash
   cd "C:\Users\Arwin\OneDrive\Desktop\Employee leave-request"
   ```
3. Install backend dependencies:
   ```bash
   npm install
   ```

### Step 4: Install Frontend Dependencies

1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Go back to the root directory:
   ```bash
   cd ..
   ```

### Step 5: Configure Database Connection (if needed)

The default database configuration in `server.js` is:
- Host: `localhost`
- User: `root`
- Password: `` (empty - default XAMPP setting)
- Database: `employee_leave_db`

If your XAMPP MySQL has a different password, edit `server.js` and update the password in the database connection configuration.

### Step 6: Start the Application

You have two options to run the application:

#### Option A: Run Both Server and Client Together (Recommended)

From the root directory, run:
```bash
npm run dev
```

This will start both the backend server (port 5000) and the React frontend (port 3000).

#### Option B: Run Separately

**Terminal 1 - Backend Server:**
```bash
npm run server
```

**Terminal 2 - Frontend Client:**
```bash
npm run client
```

### Step 7: Access the Application

1. Open your web browser
2. Navigate to `http://localhost:3000`
3. You should see the login page

## Default Admin Account

The system automatically creates an admin account when the server starts:

- **Email**: `admin@admin`
- **Password**: `admin`
- **Name**: `admin`

You can use these credentials to log in as an admin.

## Usage Guide

### For Employees:

1. **Sign Up**:
   - Click on "Sign up" link on the login page
   - Fill in your name, email, department, and password
   - Click "Sign Up"

2. **Login**:
   - Enter your email and password
   - Click "Login"

3. **Submit Leave Request**:
   - After logging in, you'll see a form to submit leave requests
   - Your name, department, and email are automatically filled
   - Select the **Start Date** for your leave (cannot be in the past)
   - Select the **End Date** for your leave (must be on or after the start date)
   - Enter the reason for your leave
   - Click "Submit Request"

4. **View Request Status**:
   - Scroll down to see all your submitted requests
   - Status will show as:
     - **PENDING** (orange) - Waiting for admin approval
     - **ACCEPTED** (green) - Approved by admin
     - **DENIED** (red) - Rejected by admin

5. **Logout**:
   - Click the "Logout" button in the top right corner

### For Admins:

1. **Login**:
   - Use the admin credentials (admin@admin / admin)
   - Click "Login"

2. **View All Leave Requests**:
   - You'll see all leave requests from all employees
   - Each request shows:
     - Employee name
     - Department
     - Email
     - **Leave dates** (start date and end date)
     - Reason for leave
     - Submission date
     - Current status

3. **Approve or Deny Requests**:
   - For pending requests, you'll see "Accept" and "Deny" buttons
   - Click "Accept" to approve the request
   - Click "Deny" to reject the request
   - The status will update immediately

4. **Logout**:
   - Click the "Logout" button in the top right corner

## Project Structure

```
Employee leave-request/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # Auth context
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── server.js               # Express backend server
├── database.sql            # Database schema
├── package.json            # Backend dependencies
├── .env                    # Environment variables
└── README.md              # This file
```

## API Endpoints

- `POST /api/register` - Register a new employee
- `POST /api/login` - Login user
- `GET /api/me` - Get current user info
- `POST /api/leave-requests` - Submit a leave request (employee)
- `GET /api/leave-requests` - Get leave requests (all for admin, own for employee)
- `PUT /api/leave-requests/:id` - Update request status (admin only)

## Troubleshooting

### Database Connection Error

- Make sure XAMPP MySQL is running
- Verify the database `employee_leave_db` exists
- Check if the password in `server.js` matches your XAMPP MySQL password

### Port Already in Use

- If port 5000 is in use, change it in `server.js` and update the proxy in `client/package.json`
- If port 3000 is in use, React will automatically use the next available port

### Module Not Found Errors

- Make sure you've run `npm install` in both root and client directories
- Delete `node_modules` folders and reinstall if issues persist

### Admin Account Not Created

- The admin account is created automatically when the server starts
- If it doesn't exist, you can manually insert it using phpMyAdmin or restart the server

## Technologies Used

- **Frontend**: React, React Router, Axios
- **Backend**: Node.js, Express.js
- **Database**: MySQL (via XAMPP)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs

## Security Notes

- Passwords are hashed using bcrypt before storing in the database
- JWT tokens are used for authentication
- API endpoints are protected with authentication middleware
- Admin-only endpoints check for admin role

## Future Enhancements

- Email notifications for request status changes
- Leave request date range selection
- Leave balance tracking
- Department-wise filtering for admins
- Export leave requests to CSV/PDF
- User profile management

## Support

If you encounter any issues:

1. Check that all prerequisites are installed correctly
2. Verify XAMPP MySQL is running
3. Ensure all dependencies are installed
4. Check the console/terminal for error messages
5. Verify database connection settings

## License

This project is open source and available for educational purposes.

