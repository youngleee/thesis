<template>
  <div class="auth-register">
    <div class="auth-form">
      <h2>Register</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="username">Username:</label>
          <input 
            type="text" 
            id="username" 
            v-model="username" 
            required 
            placeholder="Choose a username"
          >
        </div>
        
        <div class="form-group">
          <label for="email">Email:</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            required 
            placeholder="Enter your email"
          >
        </div>
        
        <div class="form-group">
          <label for="password">Password:</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            required 
            placeholder="Enter your password (min 6 characters)"
            minlength="6"
          >
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">Confirm Password:</label>
          <input 
            type="password" 
            id="confirmPassword" 
            v-model="confirmPassword" 
            required 
            placeholder="Confirm your password"
          >
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <button type="submit" :disabled="isLoading" class="submit-btn">
          <span v-if="isLoading">Creating account...</span>
          <span v-else>Register</span>
        </button>
      </form>
      
      <div class="auth-links">
        <p>Already have an account? <a href="#" @click.prevent="$emit('switch-to-login')">Login here</a></p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AuthRegister',
  emits: ['register-success', 'switch-to-login'],
  data() {
    return {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      error: '',
      isLoading: false
    }
  },
  methods: {
    async handleRegister() {
      this.error = ''
      
      // Validation
      if (this.password !== this.confirmPassword) {
        this.error = 'Passwords do not match'
        return
      }
      
      if (this.password.length < 6) {
        this.error = 'Password must be at least 6 characters long'
        return
      }
      
      this.isLoading = true
      
      try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            username: this.username,
            email: this.email,
            password: this.password
          })
        })
        
        const data = await response.json()
        
        if (response.ok) {
          this.$emit('register-success', data.user)
          this.username = ''
          this.email = ''
          this.password = ''
          this.confirmPassword = ''
        } else {
          this.error = data.error || 'Registration failed'
        }
      } catch (err) {
        console.error('Registration error:', err)
        this.error = 'Network error. Please try again.'
      } finally {
        this.isLoading = false
      }
    }
  }
}
</script>

<style scoped>
.auth-register {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.auth-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.auth-form h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #2196f3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
}

.error-message {
  color: #d32f2f;
  background: #ffebee;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.submit-btn {
  width: 100%;
  padding: 0.75rem;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #1976d2;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.auth-links {
  text-align: center;
  margin-top: 1rem;
}

.auth-links a {
  color: #2196f3;
  text-decoration: none;
}

.auth-links a:hover {
  text-decoration: underline;
}
</style> 