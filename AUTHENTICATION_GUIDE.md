# Authentication System - Implementation Guide

## 🔐 Overview
Your Sales & Distribution Management System now has a complete authentication system with:
- User login/logout
- JWT token-based authentication
- Role-based access control (Admin, Manager, User)
- Secure password hashing with bcrypt
- Protected routes
- Session management

## 🚀 Quick Start

### Default Admin Credentials
```
Username: admin
Password: admin123
```
⚠️ **IMPORTANT**: Change this password immediately after first login!

### How to Login
1. Start both backend and frontend servers
2. Navigate to http://localhost:3000
3. You'll see the login screen
4. Enter username: `admin` and password: `admin123`
5. Click "Sign In"

## 📁 Files Added/Modified

### Backend Files Created:
1. `/backend/src/config/auth-schema.sql` - Database schema for users/sessions
2. `/backend/src/config/setup-auth.js` - Script to create auth tables
3. `/backend/src/middleware/auth.js` - Authentication middleware
4. `/backend/src/models/User.js` - User model with auth methods
5. `/backend/src/controllers/authController.js` - Auth endpoints
6. `/backend/src/routes/authRoutes.js` - Auth routes

### Backend Files Modified:
- `/backend/src/server.js` - Added auth routes and cookie-parser

### Frontend Files Created:
1. `/frontend/src/pages/Login.js` - Beautiful login page

### Frontend Files Modified:
- `/frontend/src/services/api.js` - Added JWT interceptors, auth endpoints
- `/frontend/src/App.js` - Added authentication check, login/logout

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user', -- 'admin', 'manager', 'user'
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Sessions Table (Optional)
```sql
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  token VARCHAR(500) NOT NULL UNIQUE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔑 API Endpoints

### Public Endpoints (No Authentication Required)

#### POST `/api/auth/login`
Login with username and password.

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@salesform.com",
      "full_name": "System Administrator",
      "role": "admin"
    }
  }
}
```

#### POST `/api/auth/register`
Register a new user (can be restricted to admin only).

**Request:**
```json
{
  "username": "john",
  "email": "john@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "role": "user"
}
```

### Protected Endpoints (Require Authentication)

#### GET `/api/auth/profile`
Get current user profile.

**Headers:**
```
Authorization: Bearer <token>
```

#### PUT `/api/auth/profile`
Update current user profile.

**Request:**
```json
{
  "email": "newemail@example.com",
  "full_name": "New Name"
}
```

#### POST `/api/auth/change-password`
Change password for current user.

**Request:**
```json
{
  "currentPassword": "oldpass",
  "newPassword": "newpass"
}
```

#### POST `/api/auth/logout`
Logout (clears client-side token).

#### GET `/api/auth/verify`
Verify if token is valid.

### Admin Only Endpoints

#### GET `/api/auth/users`
Get all users (admin only).

## 🛡️ Using Authentication in Code

### Frontend - Making Authenticated Requests

The API service automatically adds the JWT token to all requests:

```javascript
import { getProducts } from '../services/api';

// Token is automatically included
const response = await getProducts();
```

### Backend - Protecting Routes

Add authentication middleware to routes:

```javascript
const { authenticate, authorize } = require('../middleware/auth');

// Require any authenticated user
router.get('/protected', authenticate, controller.method);

// Require specific role
router.get('/admin-only', authenticate, authorize('admin'), controller.method);

// Multiple roles
router.get('/managers', authenticate, authorize('admin', 'manager'), controller.method);
```

### Backend - Accessing User Info

In controllers, after authentication:

```javascript
exports.someMethod = async (req, res, next) => {
  // User info available after authenticate middleware
  const userId = req.user.id;
  const username = req.user.username;
  const role = req.user.role;
  
  // Use in your logic
  console.log(`Request by: ${username} (${role})`);
};
```

## 👥 User Roles

### Admin
- Full access to all features
- Can manage users
- Can view, create, edit, delete everything

### Manager
- Can view and edit most features
- Cannot manage users
- Limited administrative functions

### User
- View-only access
- Cannot modify data
- Read-only reports

## 🔒 Security Features

### Password Security
- Passwords hashed with bcrypt (10 salt rounds)
- Never stored in plain text
- Strong password validation (minimum 6 characters)

### JWT Token
- Signed with secret key (store in `.env`)
- Expires after 24 hours by default
- Includes user ID, username, email, role

### Session Management
- Token stored in localStorage (frontend)
- Token automatically added to API requests
- Auto-logout on token expiration
- Manual logout clears token

### Environment Variables
Add to `/backend/.env`:
```
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=24h
```

## 📝 Common Tasks

### Creating a New User

**Option 1: Via API**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "user@example.com",
    "password": "password123",
    "full_name": "New User",
    "role": "user"
  }'
```

**Option 2: Via Database**
```sql
INSERT INTO users (username, email, password_hash, full_name, role)
VALUES ('newuser', 'user@example.com', '<bcrypt-hash>', 'New User', 'user');
```

### Changing Admin Password

**Option 1: Via API (when logged in)**
```javascript
import { changePassword } from '../services/api';

await changePassword({
  currentPassword: 'admin123',
  newPassword: 'newSecurePassword123!'
});
```

**Option 2: Via Script**
```bash
cd backend
node reset-admin-password.js
```

### Resetting a User Password (Admin)

1. Generate password hash:
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('newpassword', 10).then(hash => console.log(hash));"
```

2. Update database:
```sql
UPDATE users 
SET password_hash = '<generated-hash>' 
WHERE username = 'username';
```

### Deactivating a User
```sql
UPDATE users SET is_active = false WHERE username = 'username';
```

### Checking Active Sessions
```sql
SELECT u.username, s.created_at, s.expires_at, s.ip_address
FROM sessions s
JOIN users u ON s.user_id = u.id
WHERE s.expires_at > NOW()
ORDER BY s.created_at DESC;
```

## 🚨 Troubleshooting

### "Invalid username or password"
- Check username is correct (case-sensitive)
- Verify password hasn't been changed
- Run password reset script if needed
- Check user exists: `SELECT * FROM users WHERE username = 'admin';`

### "Session expired"
- Token expired after 24 hours
- Login again to get new token
- Token stored in localStorage

### "Access denied"
- User doesn't have required role
- Check user role: `SELECT role FROM users WHERE username = 'admin';`
- Update role if needed: `UPDATE users SET role = 'admin' WHERE username = 'user';`

### Backend won't start
- Check `.env` file exists
- Verify JWT_SECRET is set
- Ensure all npm packages installed: `npm install`

### Login page doesn't appear
- Check frontend is running: `npm start`
- Clear browser cache/localStorage
- Check console for errors

## 📦 NPM Packages Added

```json
{
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "cookie-parser": "^1.4.6"
}
```

Install with:
```bash
cd backend
npm install bcryptjs jsonwebtoken cookie-parser
```

## 🎨 UI Features

### Login Page
- Modern gradient design
- Responsive layout
- Error message display
- Default credentials shown
- Auto-focus on username field

### Navigation
- User info display (name + role)
- Logout button
- Role badge (👑 Admin, 👔 Manager, 👤 User)

### Auto-Logout
- Automatically logs out on token expiration
- Redirects to login page
- Clears stored credentials

## 🔧 Customization

### Change Token Expiration
In `.env`:
```
JWT_EXPIRES_IN=7d   # 7 days
JWT_EXPIRES_IN=12h  # 12 hours
JWT_EXPIRES_IN=30m  # 30 minutes
```

### Add More User Roles
1. Update schema:
```sql
ALTER TABLE users 
  DROP CONSTRAINT users_role_check,
  ADD CONSTRAINT users_role_check 
  CHECK (role IN ('admin', 'manager', 'user', 'supervisor'));
```

2. Update authorization in routes as needed

### Custom Password Requirements
In `/backend/src/controllers/authController.js`:
```javascript
if (password.length < 8) {
  return res.status(400).json({
    error: 'Password must be at least 8 characters'
  });
}

// Add regex for complexity
const hasUpperCase = /[A-Z]/.test(password);
const hasLowerCase = /[a-z]/.test(password);
const hasNumbers = /\d/.test(password);
const hasSpecialChar = /[!@#$%^&*]/.test(password);

if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
  return res.status(400).json({
    error: 'Password must contain uppercase, lowercase, number, and special character'
  });
}
```

## ✅ Testing Checklist

- [ ] Can login with admin credentials
- [ ] Dashboard loads after login
- [ ] Logout works and redirects to login
- [ ] Token persists on page refresh
- [ ] Expired token triggers re-login
- [ ] All API endpoints require authentication
- [ ] User info displays in nav bar
- [ ] Password change works
- [ ] Cannot access app without login

## 🚀 Next Steps

1. **Change default admin password** immediately
2. **Set secure JWT_SECRET** in production
3. **Create additional users** with appropriate roles
4. **Add password reset** functionality (via email)
5. **Add "Remember me"** option
6. **Add audit logging** for security events
7. **Add two-factor authentication** (2FA)
8. **Add session timeout** warning
9. **Add user management** page for admins

## 📞 Support

If you encounter issues:
1. Check backend logs
2. Check browser console
3. Verify database tables exist: `\dt` in psql
4. Test endpoints with curl
5. Run password reset script if needed

---

**Authentication system is now fully functional! 🎉**

Login at: http://localhost:3000 with `admin / admin123`
