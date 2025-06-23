import React from 'react';
import UserProfile from './components/UserProfile';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>User Profile Micro-Frontend</h1>
      </header>
      <main>
        <UserProfile />
      </main>
    </div>
  );
}

export default App; 