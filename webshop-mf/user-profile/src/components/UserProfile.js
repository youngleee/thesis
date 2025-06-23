import React, { useState, useEffect } from 'react';
import './UserProfile.css';

const UserProfile = () => {
  const [user, setUser] = useState({
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://via.placeholder.com/100',
    preferences: {
      newsletter: true,
      notifications: false,
      theme: 'light'
    }
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(user);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    // Fetch cart items from backend to demonstrate cross-framework communication
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/cart');
      const data = await response.json();
      setCartItems(data.items || []);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm(user);
  };

  const handleSave = () => {
    setUser(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm(user);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePreferenceChange = (key, value) => {
    setEditForm(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  return (
    <div className="user-profile">
      <div className="profile-header">
        <img src={user.avatar} alt="User Avatar" className="avatar" />
        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </div>

      <div className="profile-content">
        {!isEditing ? (
          <div className="profile-info">
            <h3>Profile Information</h3>
            <div className="info-item">
              <strong>Name:</strong> {user.name}
            </div>
            <div className="info-item">
              <strong>Email:</strong> {user.email}
            </div>
            
            <h3>Preferences</h3>
            <div className="info-item">
              <strong>Newsletter:</strong> {user.preferences.newsletter ? 'Yes' : 'No'}
            </div>
            <div className="info-item">
              <strong>Notifications:</strong> {user.preferences.notifications ? 'Yes' : 'No'}
            </div>
            <div className="info-item">
              <strong>Theme:</strong> {user.preferences.theme}
            </div>

            <button onClick={handleEdit} className="edit-btn">
              Edit Profile
            </button>
          </div>
        ) : (
          <div className="profile-edit">
            <h3>Edit Profile</h3>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={editForm.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleInputChange}
              />
            </div>
            
            <h3>Preferences</h3>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={editForm.preferences.newsletter}
                  onChange={(e) => handlePreferenceChange('newsletter', e.target.checked)}
                />
                Newsletter
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={editForm.preferences.notifications}
                  onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                />
                Notifications
              </label>
            </div>
            <div className="form-group">
              <label>Theme:</label>
              <select
                value={editForm.preferences.theme}
                onChange={(e) => handlePreferenceChange('theme', e.target.value)}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div className="button-group">
              <button onClick={handleSave} className="save-btn">
                Save
              </button>
              <button onClick={handleCancel} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="cart-summary">
          <h3>Cart Summary (Cross-Framework Data)</h3>
          <p>Items in cart: {cartItems.length}</p>
          <p>Total: ${cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 