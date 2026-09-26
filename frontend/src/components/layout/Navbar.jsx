import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

function Navbar() {
  const { token, user, logout } = useAuth();

  return (
    <nav className="bg-blue-600 text-white">
      <div className="max-w-7xl mx-auto flex justify-between items-center p-4">

        <Link
          to="/"
          className="text-2xl font-bold"
        >
          TickeGo
        </Link>

        <div className="flex gap-6 items-center">

          <Link to="/">Home</Link>

          <Link to="/events">Events</Link>

          {token && (
            <>
              {user?.role === "organizationAdmin" || user?.role === "departmentHead" || user?.role === "admin" ? (
                <>
                  <Link to="/organizer/dashboard">Dashboard</Link>
                  <Link to="/organizer/create-event">Create Event</Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard">Dashboard</Link>
                  <Link to="/my-tickets">My Tickets</Link>
                </>
              )}

              <button onClick={logout}>
                Logout
              </button>
            </>
          )}

          {!token && (
            <>
              <Link to="/login">
                Login
              </Link>

              <Link to="/signup">
                Signup
              </Link>
            </>
          )}

        </div>

      </div>
    </nav>
  );
}

export default Navbar;