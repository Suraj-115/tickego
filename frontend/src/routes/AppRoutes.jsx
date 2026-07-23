import { Routes, Route } from "react-router-dom";

import Home from "../pages/pub/Home";
import Events from "../pages/pub/Events";
import EventDetails from "../pages/pub/EventDetails";

import Dashboard from "../pages/user/Dashboard";
import MyTickets from "../pages/user/MyTickets";

import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

import CreateEvent from "../pages/organizer/CreateEvent";

import ProtectedRoute from "../components/auth/ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/events" element={<Events />} />
      <Route path="/events/:id" element={<EventDetails />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-tickets"
        element={
          <ProtectedRoute>
            <MyTickets />
          </ProtectedRoute>
        }
      />

      <Route
        path="/organizer/create-event"
        element={
          <ProtectedRoute>
            <CreateEvent />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;