# User Authentication System Documentation

## Overview

This document provides a comprehensive analysis of the user authentication system implemented in the WebShop micro-frontend application. The authentication system demonstrates how to integrate user management capabilities into a micro-frontend architecture while maintaining security best practices and seamless user experience.

## Architecture Overview

### System Components

The authentication system consists of three main components:

1. **Backend Authentication Service** - Node.js/Express server with session management
2. **Database Layer** - SQLite with user and cart tables
3. **Frontend Authentication Components** - Vue.js components integrated into the shell application

### Technology Stack

- **Backend**: Node.js, Express.js, bcrypt, express-session
- **Database**: SQLite3 with automatic schema management
- **Frontend**: Vue.js 3, Webpack 5 Module Federation
- **Security**: bcrypt password hashing, session-based authentication
- **Communication**: RESTful APIs with CORS support

## Database Schema Design

### Users Table

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Enhanced Cart Items Table

```sql
CREATE TABLE cart_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (product_id) REFERENCES products (id)
);
```

### Key Design Decisions

1. **User-Cart Association**: Cart items are now associated with specific users via `user_id` foreign key
2. **Anonymous Shopping**: `user_id` can be NULL to support guest shopping
3. **Data Integrity**: Foreign key constraints ensure referential integrity
4. **Audit Trail**: `created_at` timestamp provides user registration history

## Backend Implementation

### Authentication Middleware

```javascript
const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  } else {
    return res.status(401).json({ error: 'Authentication required' });
  }
};
```

### Session Configuration

```javascript
app.use(session({
  secret: 'webshop-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
```

### API Endpoints

#### User Registration
- **Endpoint**: `POST /api/auth/register`
- **Purpose**: Create new user accounts
- **Validation**: Username/email uniqueness, password strength
- **Security**: Password hashing with bcrypt (10 salt rounds)

#### User Login
- **Endpoint**: `POST /api/auth/login`
- **Purpose**: Authenticate existing users
- **Security**: Password verification using bcrypt.compare()
- **Response**: User session creation with user data

#### User Logout
- **Endpoint**: `POST /api/auth/logout`
- **Purpose**: Terminate user sessions
- **Security**: Session destruction and cookie cleanup

#### Current User Info
- **Endpoint**: `GET /api/auth/me`
- **Purpose**: Retrieve current user information
- **Usage**: Frontend authentication state management

### Password Security Implementation

```javascript
// Password hashing during registration
const saltRounds = 10;
const passwordHash = await bcrypt.hash(password, saltRounds);

// Password verification during login
const isValidPassword = await bcrypt.compare(password, user.password_hash);
```

## Frontend Implementation

### Authentication Components Architecture

The frontend authentication system is implemented using Vue.js 3 components integrated into the shell application:

#### 1. AuthLogin Component
- **Purpose**: User login interface
- **Features**: Email/password form, error handling, loading states
- **Integration**: Emits events for successful login and mode switching

#### 2. AuthRegister Component
- **Purpose**: User registration interface
- **Features**: Username/email/password form, validation, password confirmation
- **Security**: Client-side validation before server submission

#### 3. UserProfile Component
- **Purpose**: User account management interface
- **Features**: Account information display, cart summary, logout functionality
- **Integration**: Real-time cart data integration

### Shell Application Integration

#### Authentication State Management

```javascript
const currentUser = ref(null)
const showAuthModal = ref(false)
const authMode = ref('login')

// Authentication status checking
const checkAuthStatus = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/me', {
      credentials: 'include'
    })
    
    if (response.ok) {
      const data = await response.json()
      currentUser.value = data.user
    } else {
      currentUser.value = null
    }
  } catch (err) {
    console.error('Error checking auth status:', err)
    currentUser.value = null
  }
}
```

#### Navigation Integration

The shell application dynamically shows/hides navigation elements based on authentication state:

- **Unauthenticated Users**: Login button
- **Authenticated Users**: Profile button, Logout button
- **Conditional Rendering**: Profile view only accessible to logged-in users

### Modal-Based Authentication Interface

The authentication system uses a modal interface for login/register forms:

```vue
<!-- Authentication Modal -->
<div v-if="showAuthModal" class="modal-overlay" @click="showAuthModal = false">
  <div class="auth-modal" @click.stop>
    <button @click="showAuthModal = false" class="close-btn">&times;</button>
    <AuthLogin 
      v-if="authMode === 'login'"
      @login-success="handleLoginSuccess"
      @switch-to-register="authMode = 'register'"
    />
    <AuthRegister 
      v-if="authMode === 'register'"
      @register-success="handleRegisterSuccess"
      @switch-to-login="authMode = 'login'"
    />
  </div>
</div>
```

## Security Considerations

### Password Security
- **Hashing Algorithm**: bcrypt with 10 salt rounds
- **Salt Generation**: Automatic salt generation for each password
- **Verification**: Secure comparison using bcrypt.compare()

### Session Security
- **Session Storage**: Server-side session management
- **Cookie Security**: HttpOnly cookies prevent XSS attacks
- **Session Expiration**: 24-hour session timeout
- **Secure Cookies**: Configurable for HTTPS in production

### Input Validation
- **Client-side**: Form validation for immediate user feedback
- **Server-side**: Comprehensive validation for all inputs
- **SQL Injection Prevention**: Parameterized queries
- **XSS Prevention**: Input sanitization and output encoding

### CORS Configuration

```javascript
app.use(cors({
  origin: ['http://localhost:8082', 'http://localhost:8083', 
           'http://localhost:8084', 'http://localhost:8085'],
  credentials: true
}));
```

## User Experience Design

### Authentication Flow

1. **Initial State**: User sees login button in navigation
2. **Login Process**: Click login → modal opens → enter credentials → session created
3. **Post-Login**: Navigation updates to show profile/logout buttons
4. **Profile Access**: Click profile → view account information and cart
5. **Logout Process**: Click logout → session terminated → return to initial state

### Error Handling

- **Network Errors**: Graceful fallback with user-friendly messages
- **Validation Errors**: Real-time feedback on form inputs
- **Authentication Errors**: Clear error messages for login/registration failures
- **Session Expiration**: Automatic redirect to login when session expires

### Responsive Design

- **Mobile-First**: Authentication components work on all screen sizes
- **Modal Responsiveness**: Authentication modal adapts to mobile screens
- **Touch-Friendly**: Large touch targets for mobile users
- **Accessibility**: Proper form labels and keyboard navigation

## Integration with Micro-Frontend Architecture

### Cross-Micro-Frontend Communication

The authentication system integrates seamlessly with the existing micro-frontend communication patterns:

1. **Session Sharing**: All micro-frontends share the same session via cookies
2. **Cart Association**: User-specific carts work across all micro-frontends
3. **WebSocket Integration**: Real-time updates respect user authentication
4. **Navigation Coordination**: Shell application manages authentication state

### Authentication State Propagation

```javascript
// Global authentication state accessible to all micro-frontends
window.__shell_app = {
  setView: (view) => { /* ... */ },
  getCurrentUser: () => currentUser.value,
  isAuthenticated: () => !!currentUser.value
}
```

## Performance Considerations

### Database Optimization
- **Indexed Fields**: Username and email fields are indexed for fast lookups
- **Efficient Queries**: Optimized cart queries with user filtering
- **Connection Pooling**: SQLite connection management

### Frontend Performance
- **Lazy Loading**: Authentication components loaded on demand
- **State Management**: Efficient reactive state updates
- **Bundle Size**: Minimal impact on overall application size

## Testing and Validation

### Backend Testing
- **API Endpoint Testing**: All authentication endpoints tested
- **Password Security**: bcrypt implementation verified
- **Session Management**: Session creation/destruction tested
- **Error Handling**: Comprehensive error scenarios covered

### Frontend Testing
- **Component Testing**: Individual authentication components tested
- **Integration Testing**: Shell application integration verified
- **User Flow Testing**: Complete authentication flows tested
- **Cross-Browser Testing**: Compatibility across major browsers

## Deployment Considerations

### Production Security
- **Environment Variables**: Sensitive configuration externalized
- **HTTPS Enforcement**: Secure cookie configuration for production
- **Session Secret**: Strong, unique session secret required
- **Database Security**: SQLite file permissions and backup strategies

### Scalability Considerations
- **Session Storage**: Consider Redis for session storage in production
- **Database Scaling**: SQLite suitable for small-medium applications
- **Load Balancing**: Stateless authentication design supports horizontal scaling

## Future Enhancements

### Planned Features
1. **Password Reset**: Email-based password recovery system
2. **Email Verification**: Account verification via email
3. **Profile Management**: User profile editing capabilities
4. **Two-Factor Authentication**: Enhanced security with 2FA
5. **Social Login**: OAuth integration with Google, Facebook, etc.

### Advanced Security Features
1. **Rate Limiting**: Prevent brute force attacks
2. **Account Lockout**: Temporary account suspension after failed attempts
3. **Audit Logging**: Comprehensive security event logging
4. **Session Management**: Advanced session controls and monitoring

## Conclusion

The user authentication system successfully demonstrates how to implement secure, user-friendly authentication in a micro-frontend architecture. The system provides:

- **Security**: Industry-standard password hashing and session management
- **User Experience**: Intuitive login/registration flow with responsive design
- **Integration**: Seamless integration with existing micro-frontend components
- **Scalability**: Foundation for future authentication enhancements
- **Maintainability**: Clean, well-documented code structure

This implementation serves as a solid foundation for user management in the WebShop application and can be extended to support more advanced authentication features as the application grows.

## Technical Specifications

### API Response Formats

#### Successful Registration
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

#### Successful Login
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

#### Error Response
```json
{
  "error": "Invalid email or password"
}
```

### Database Queries

#### User Creation
```sql
INSERT INTO users (username, email, password_hash) 
VALUES (?, ?, ?)
```

#### User Authentication
```sql
SELECT * FROM users WHERE email = ?
```

#### User-Specific Cart
```sql
SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price, p.image 
FROM cart_items ci
JOIN products p ON ci.product_id = p.id
WHERE ci.user_id = ?
```

### Component Props and Events

#### AuthLogin Component
- **Props**: None
- **Events**: 
  - `login-success(user)`: Emitted on successful login
  - `switch-to-register`: Emitted when user wants to register

#### AuthRegister Component
- **Props**: None
- **Events**:
  - `register-success(user)`: Emitted on successful registration
  - `switch-to-login`: Emitted when user wants to login

#### UserProfile Component
- **Props**: None
- **Events**:
  - `logout`: Emitted when user logs out 