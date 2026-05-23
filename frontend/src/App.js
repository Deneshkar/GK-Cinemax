import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Pages
import HomePage from './pages/HomePage';
import MoviePage from './pages/MoviePage';
import SeatPage from './pages/SeatPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AdminDashboard from './pages/AdminDashboard';

// Components
import Navbar from './components/Navbar';

// Global styles
import './styles/global.css';

// This is the main app — it defines which page shows for which URL
function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="page-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movie/:id" element={<MoviePage />} />
          <Route path="/seats/:showtimeId" element={<SeatPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;