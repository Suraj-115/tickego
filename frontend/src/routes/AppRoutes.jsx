import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/pub/Home";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;

// Public Routes
//     /
//     /about
//     /contact
//     /events
//     /events/:id

// Auth Routes
//     /login
//     /signup
//     /forgot-password
//     /reset-password

// User Routes
//     /dashboard
//     /profile
//     /my-tickets

// Organizer Routes
//     /organizer
//     /organizer/events
//     /organizer/create-event
//     /organizer/participants
//     /organizer/scanner

// Admin Routes
//     /admin
//     /admin/users
//     /admin/organizations
