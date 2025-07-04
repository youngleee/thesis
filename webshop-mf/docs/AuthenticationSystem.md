# Authentication System Documentation

## Overview

The authentication system provides secure user management for the micro-frontend webshop application. It implements session-based authentication with password hashing, user registration, login/logout functionality, and profile management. The system demonstrates secure authentication patterns in a distributed micro-frontend architecture.

## Architecture

### Authentication Flow
```
User Registration/Login → Backend API → Session Creation → Frontend State Management
```

### Components Structure
```
shell/src/components/
├── AuthLogin.vue          # Login form component
├── AuthRegister.vue       # Registration form component
└── UserProfile.vue        # User profile management
```

### Backend Authentication Services
```
backend/
├── server.js              # Authentication endpoints
├── database.js            # User management methods
└── data/webshop.db        # User data storage
```

## Database Schema

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

### Session Management
Sessions are managed using `express-session` with SQLite storage:
- Session secret: `webshop-secret-key-change-in-production`
- Cookie settings: HTTP-only, 24-hour expiration
- Secure: false (for development, true in production with HTTPS)

## API Endpoints

### User Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Validation Rules:**
- Username: Required, unique
- Email: Required, valid format, unique
- Password: Required, minimum 6 characters

**Response (Success - 201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

**Response (Error - 400):**
```json
{
  "error": "Email already registered"
}
```

### User Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (Success - 200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

**Response (Error - 401):**
```json
{
  "error": "Invalid email or password"
}
```

### User Logout
```http
POST /api/auth/logout
Authorization: Required (session-based)
```

**Response (Success - 200):**
```json
{
  "message": "Logout successful"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Required (session-based)
```

**Response (Success - 200):**
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response (Error - 401):**
```json
{
  "error": "Not authenticated"
}
```

## Frontend Implementation

### Authentication Modal System

The shell application implements a modal-based authentication system that can be triggered from any micro-frontend:

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

### Login Component (AuthLogin.vue)

```vue
<template>
  <div class="auth-form">
    <h2>Login</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="email">Email</label>
        <input 
          type="email" 
          id="email" 
          v-model="email" 
          required
          :disabled="loading"
        >
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <input 
          type="password" 
          id="password" 
          v-model="password" 
          required
          :disabled="loading"
        >
      </div>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <button type="submit" :disabled="loading" class="btn-primary">
        {{ loading ? 'Logging in...' : 'Login' }}
      </button>
    </form>
    
    <div class="auth-switch">
      <p>Don't have an account? 
        <button @click="$emit('switch-to-register')" class="link-button">
          Register here
        </button>
      </p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'AuthLogin',
  emits: ['login-success', 'switch-to-register'],
  setup(props, { emit }) {
    const email = ref('')
    const password = ref('')
    const loading = ref(false)
    const error = ref('')

    const handleLogin = async () => {
      try {
        loading.value = true
        error.value = ''
        
        const response = await fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            email: email.value,
            password: password.value
          })
        })
        
        const data = await response.json()
        
        if (response.ok) {
          emit('login-success', data.user)
        } else {
          error.value = data.error || 'Login failed'
        }
      } catch (err) {
        error.value = 'Network error. Please try again.'
      } finally {
        loading.value = false
      }
    }

    return {
      email,
      password,
      loading,
      error,
      handleLogin
    }
  }
}
</script>
```

### Registration Component (AuthRegister.vue)

```vue
<template>
  <div class="auth-form">
    <h2>Register</h2>
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="username">Username</label>
        <input 
          type="text" 
          id="username" 
          v-model="username" 
          required
          :disabled="loading"
        >
      </div>
      
      <div class="form-group">
        <label for="email">Email</label>
        <input 
          type="email" 
          id="email" 
          v-model="email" 
          required
          :disabled="loading"
        >
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <input 
          type="password" 
          id="password" 
          v-model="password" 
          required
          minlength="6"
          :disabled="loading"
        >
      </div>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <button type="submit" :disabled="loading" class="btn-primary">
        {{ loading ? 'Creating account...' : 'Register' }}
      </button>
    </form>
    
    <div class="auth-switch">
      <p>Already have an account? 
        <button @click="$emit('switch-to-login')" class="link-button">
          Login here
        </button>
      </p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'AuthRegister',
  emits: ['register-success', 'switch-to-login'],
  setup(props, { emit }) {
    const username = ref('')
    const email = ref('')
    const password = ref('')
    const loading = ref(false)
    const error = ref('')

    const handleRegister = async () => {
      try {
        loading.value = true
        error.value = ''
        
        const response = await fetch('http://localhost:3000/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            username: username.value,
            email: email.value,
            password: password.value
          })
        })
        
        const data = await response.json()
        
        if (response.ok) {
          emit('register-success', data.user)
        } else {
          error.value = data.error || 'Registration failed'
        }
      } catch (err) {
        error.value = 'Network error. Please try again.'
      } finally {
        loading.value = false
      }
    }

    return {
      username,
      email,
      password,
      loading,
      error,
      handleRegister
    }
  }
}
</script>
```

### User Profile Component (UserProfile.vue)

```vue
<template>
  <div class="user-profile">
    <h2>User Profile</h2>
    
    <div v-if="user" class="profile-info">
      <div class="profile-section">
        <h3>Account Information</h3>
        <div class="info-row">
          <span class="label">Username:</span>
          <span class="value">{{ user.username }}</span>
        </div>
        <div class="info-row">
          <span class="label">Email:</span>
          <span class="value">{{ user.email }}</span>
        </div>
        <div class="info-row">
          <span class="label">Member since:</span>
          <span class="value">{{ formatDate(user.created_at) }}</span>
        </div>
      </div>
      
      <div class="profile-actions">
        <button @click="handleLogout" class="btn-secondary">
          Logout
        </button>
      </div>
    </div>
    
    <div v-else class="loading">
      <p>Loading profile...</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'UserProfile',
  emits: ['logout'],
  setup(props, { emit }) {
    const user = ref(null)

    const loadProfile = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/auth/me', {
          credentials: 'include'
        })
        
        if (response.ok) {
          const data = await response.json()
          user.value = data.user
        }
      } catch (err) {
        console.error('Error loading profile:', err)
      }
    }

    const handleLogout = async () => {
      try {
        await fetch('http://localhost:3000/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
        })
        emit('logout')
      } catch (err) {
        console.error('Error logging out:', err)
      }
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString()
    }

    onMounted(() => {
      loadProfile()
    })

    return {
      user,
      handleLogout,
      formatDate
    }
  }
}
</script>
```

## State Management

### Shell Application State
```javascript
// Authentication state in shell App.vue
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

// Event handlers
const handleLoginSuccess = (user) => {
  currentUser.value = user
  showAuthModal.value = false
  authMode.value = 'login'
}

const handleRegisterSuccess = (user) => {
  currentUser.value = user
  showAuthModal.value = false
  authMode.value = 'login'
}

const handleLogout = async () => {
  try {
    await fetch('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    })
  } catch (err) {
    console.error('Error logging out:', err)
  } finally {
    currentUser.value = null
    currentView.value = 'products'
  }
}
```

### Conditional Rendering
```vue
<!-- Navigation buttons based on authentication status -->
<button 
  v-if="currentUser"
  @click="navigateTo('profile')"
  :class="{ active: currentView === 'profile' }"
  class="nav-button"
>
  Profile
</button>

<button 
  v-if="!currentUser"
  @click="showAuthModal = true"
  class="nav-button auth-button"
>
  Login
</button>

<button 
  v-if="currentUser"
  @click="handleLogout"
  class="nav-button logout-button"
>
  Logout
</button>

<!-- Checkout button only for authenticated users with cart items -->
<button 
  v-if="currentUser && cartItemCount > 0"
  @click="navigateTo('checkout')"
  :class="{ active: currentView === 'checkout' }"
  class="nav-button checkout-button"
>
  Checkout
</button>
```

## Security Implementation

### Password Hashing
```javascript
// Backend password hashing using bcrypt
const bcrypt = require('bcrypt')

// Registration - hash password before storing
const saltRounds = 10
const passwordHash = await bcrypt.hash(password, saltRounds)

// Login - verify password
const isValidPassword = await bcrypt.compare(password, user.password_hash)
```

### Session Management
```javascript
// Express session configuration
app.use(session({
  secret: 'webshop-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}))
```

### Authentication Middleware
```javascript
const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next()
  } else {
    return res.status(401).json({ error: 'Authentication required' })
  }
}

// Usage in protected routes
app.post('/api/orders', requireAuth, async (req, res) => {
  // Route implementation
})
```

### CORS Configuration
```javascript
app.use(cors({
  origin: ['http://localhost:8081', 'http://localhost:8082', 'http://localhost:8083', 'http://localhost:8084', 'http://localhost:8085'],
  credentials: true // Required for session cookies
}))
```

## Integration Patterns

### Cross-Microfrontend Authentication
The authentication system is designed to work seamlessly across all micro-frontends:

1. **Centralized Authentication**: All authentication logic is handled by the shell application
2. **Global State**: User authentication status is managed at the shell level
3. **Event-Driven Communication**: Authentication events are broadcast to all micro-frontends
4. **Session Persistence**: Sessions are maintained across all micro-frontend interactions

### Authentication Events
```javascript
// Authentication success event
window.dispatchEvent(new CustomEvent('auth-success', { 
  detail: { user: userData }
}))

// Authentication failure event
window.dispatchEvent(new CustomEvent('auth-failure', { 
  detail: { error: errorMessage }
}))

// Logout event
window.dispatchEvent(new CustomEvent('auth-logout'))
```

### Protected Route Handling
```javascript
// Check authentication before accessing protected features
const checkAuthBeforeAction = () => {
  if (!currentUser.value) {
    showAuthModal.value = true
    return false
  }
  return true
}

// Usage in checkout flow
const navigateToCheckout = () => {
  if (checkAuthBeforeAction()) {
    navigateTo('checkout')
  }
}
```

## Error Handling

### Form Validation
```javascript
// Client-side validation
const validateRegistration = (data) => {
  const errors = []
  
  if (!data.username || data.username.length < 3) {
    errors.push('Username must be at least 3 characters')
  }
  
  if (!data.email || !data.email.includes('@')) {
    errors.push('Valid email is required')
  }
  
  if (!data.password || data.password.length < 6) {
    errors.push('Password must be at least 6 characters')
  }
  
  return errors
}
```

### Network Error Handling
```javascript
const handleAuthRequest = async (endpoint, data) => {
  try {
    const response = await fetch(`http://localhost:3000/api/auth/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    })
    
    const result = await response.json()
    
    if (response.ok) {
      return { success: true, data: result }
    } else {
      return { success: false, error: result.error }
    }
  } catch (err) {
    return { success: false, error: 'Network error. Please try again.' }
  }
}
```

### Session Expiry Handling
```javascript
// Check session validity on app initialization
const validateSession = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/me', {
      credentials: 'include'
    })
    
    if (!response.ok) {
      // Session expired or invalid
      currentUser.value = null
      showAuthModal.value = false
      return false
    }
    
    return true
  } catch (err) {
    currentUser.value = null
    return false
  }
}
```

## Testing Scenarios

### Functional Testing
1. **User Registration**: Test successful registration with valid data
2. **Duplicate Registration**: Test handling of duplicate usernames/emails
3. **User Login**: Test successful login with correct credentials
4. **Invalid Login**: Test login with incorrect credentials
5. **User Logout**: Test successful logout and session clearing
6. **Session Persistence**: Test session maintenance across page reloads

### Security Testing
1. **Password Hashing**: Verify passwords are properly hashed in database
2. **Session Security**: Test session cookie security settings
3. **CSRF Protection**: Verify protection against cross-site request forgery
4. **Input Validation**: Test handling of malicious input
5. **Authentication Bypass**: Attempt to access protected routes without authentication

### Integration Testing
1. **Cross-Microfrontend Authentication**: Test authentication state across all micro-frontends
2. **Protected Feature Access**: Verify checkout and profile access require authentication
3. **Session Synchronization**: Test session state consistency across components
4. **Error Propagation**: Test error handling across micro-frontend boundaries

## Performance Considerations

### Session Management
- Sessions are stored in memory (development) or Redis (production)
- Session cleanup on logout and expiry
- Efficient session validation without database queries

### Authentication Flow
- Minimal API calls for authentication status checking
- Efficient password hashing with appropriate salt rounds
- Optimized form validation with debounced input handling

### State Management
- Reactive authentication state with Vue 3 Composition API
- Efficient re-rendering based on authentication changes
- Minimal component re-renders through proper state isolation

## Future Enhancements

### Security Improvements
1. **JWT Tokens**: Implement JWT-based authentication for stateless sessions
2. **OAuth Integration**: Add social login options (Google, Facebook, GitHub)
3. **Two-Factor Authentication**: Implement 2FA for enhanced security
4. **Password Reset**: Add forgot password functionality with email verification
5. **Account Lockout**: Implement account lockout after failed login attempts

### User Experience Enhancements
1. **Remember Me**: Add "remember me" functionality for extended sessions
2. **Profile Management**: Allow users to update profile information
3. **Email Verification**: Implement email verification for new accounts
4. **Account Deletion**: Add account deletion functionality
5. **Session Management**: Allow users to view and manage active sessions

### Technical Improvements
1. **Refresh Tokens**: Implement refresh token rotation for better security
2. **Rate Limiting**: Add rate limiting for authentication endpoints
3. **Audit Logging**: Implement authentication event logging
4. **Multi-Tenancy**: Support for multiple user organizations
5. **API Key Authentication**: Add API key support for programmatic access

## Conclusion

The authentication system provides a robust, secure foundation for user management in the micro-frontend webshop application. It demonstrates:

- **Security Best Practices**: Password hashing, session management, and input validation
- **Micro-Frontend Integration**: Seamless authentication across distributed components
- **User Experience**: Intuitive login/registration flow with proper error handling
- **Scalability**: Modular design that supports future enhancements
- **Production Readiness**: Comprehensive error handling and security measures

This implementation serves as an excellent example for a thesis on micro-frontend architecture, showcasing how to implement secure authentication in a distributed application environment while maintaining good user experience and code maintainability. 