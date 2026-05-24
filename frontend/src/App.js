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
import EditMoviePage from './pages/EditMoviePage';
import EditProfilePage from './pages/EditProfilePage'; // imported Edit Profile Component
import ComingSoonPage from './pages/ComingSoonPage'; // imported Coming Soon Component

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
          <Route path="/profile" element={<EditProfilePage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/movies/:id" element={<EditMoviePage />} />
          <Route path="/coming-soon" element={<ComingSoonPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;