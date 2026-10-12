import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminSignup from './pages/AdminSignup';
import Dashboard from './pages/Dashboard';
import ManageClubs from './pages/ManageClubs';
import CreateClub from './pages/CreateClub';
import CreateEvent from './pages/CreateEvent';
import EventDetails from './pages/EventDetails';
import Scanner from './pages/Scanner';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import AdminDashboard from './pages/AdminDashboard';
import ClubStatistics from './pages/ClubStatistics';
import ClubEvents from './pages/ClubEvents';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/admin-signup" element={<AdminSignup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/clubs/:id/statistics" element={<ClubStatistics />} />
      <Route path="/admin/clubs/:id/events" element={<ClubEvents />} />
      <Route path="/manage-clubs" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/create-club" element={<Navigate to="/admin/dashboard?tab=create" replace />} />
      <Route path="/create-event" element={<CreateEvent />} />
      <Route path="/events/:id" element={<EventDetails />} />
      <Route path="/scanner" element={<Scanner />} />
      <Route path="/booked-events" element={<Navigate to="/dashboard?tab=booked" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
