import React, { createContext, useState, useContext } from 'react';

// Creates the shared login state container
const AuthContext = createContext();

// This wraps the whole app and provides login state to every component
function AuthProvider({ children }) {

  // Read user from localStorage so login persists after page refresh
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('gkUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Saves the user to state and localStorage when they log in
  function login(userData, token) {
    localStorage.setItem('gkUser', JSON.stringify(userData));
    localStorage.setItem('gkToken', token);
    setCurrentUser(userData);
  }

  // Clears the user from state and localStorage when they log out
  function logout() {
    localStorage.removeItem('gkUser');
    localStorage.removeItem('gkToken');
    setCurrentUser(null);
  }

  // Updates the user safely after profile edit without breaking token
  function updateCurrentUser(userData, token) {
    localStorage.setItem('gkUser', JSON.stringify(userData));
    if (token) {
      localStorage.setItem('gkToken', token);
    }
    setCurrentUser(userData);
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// A shortcut hook so any component can read auth state easily
function useAuth() {
  return useContext(AuthContext);
}

export { AuthProvider, useAuth };