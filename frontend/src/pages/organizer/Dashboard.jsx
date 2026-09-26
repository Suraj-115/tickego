import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const response = await api.get("/event/my-events");
        setEvents(response.data);
      } catch (error) {
        console.error("Failed to fetch events", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  const totalRegistrations = events.reduce((sum, event) => sum + (event.registeredUsers?.length || 0), 0);
  const paidEvents = events.filter(e => e.isPaid);
  const totalRevenue = paidEvents.reduce((sum, event) => sum + ((event.registeredUsers?.length || 0) * (event.ticketPrice || 0)), 0);

  return (
    <div className="max-w-6xl mx-auto p-4 mt-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
        <div className="space-x-4">
          <Link to="/organizer/create-event" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">
            + Create Event
          </Link>
          <Link to="/organizer/scanner" className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700">
            Open Scanner
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-500">
          <h3 className="text-gray-500 mb-1">My Events</h3>
          <p className="text-3xl font-bold">{events.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-purple-500">
          <h3 className="text-gray-500 mb-1">Total Registrations</h3>
          <p className="text-3xl font-bold">{totalRegistrations}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-green-500">
          <h3 className="text-gray-500 mb-1">Paid Events</h3>
          <p className="text-3xl font-bold">{paidEvents.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-yellow-500">
          <h3 className="text-gray-500 mb-1">Estimated Revenue</h3>
          <p className="text-3xl font-bold">₹{totalRevenue}</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Manage Events</h2>
      
      {events.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow text-center text-gray-500">
          You haven't created any events yet.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-4 font-semibold">Event Name</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Registrations</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event._id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="p-4 font-medium">{event.title}</td>
                  <td className="p-4 text-gray-600">{new Date(event.eventDate).toLocaleDateString()}</td>
                  <td className="p-4 text-gray-600">
                    {event.isPaid ? (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Paid (₹{event.ticketPrice})</span>
                    ) : (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Free</span>
                    )}
                  </td>
                  <td className="p-4">
                    {event.registeredUsers?.length || 0} / {event.maxParticipants || "∞"}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Link to={`/events/${event._id}`} className="text-blue-600 hover:underline">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default OrganizerDashboard;
