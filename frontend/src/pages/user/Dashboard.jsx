import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ticketRes, eventRes] = await Promise.all([
          api.get("/ticket/my-tickets"),
          api.get("/event/registered")
        ]);
        setTickets(ticketRes.data);
        setRegisteredEvents(eventRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  const upcomingTickets = tickets.filter(t => !t.isUsed && new Date(t.event?.eventDate) > new Date());
  const usedTickets = tickets.filter(t => t.isUsed);
  const paidTicketsCount = tickets.filter(t => t.status === "paid").length;

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">My Dashboard</h1>
        <Link to="/events" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">
          Browse Events
        </Link>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mt-8 mb-8">
        <div className="bg-white shadow rounded-xl p-6 border-l-4 border-blue-500">
          <h2 className="text-gray-500 mb-1">Upcoming Events</h2>
          <p className="text-3xl font-bold">{upcomingTickets.length}</p>
        </div>

        <div className="bg-white shadow rounded-xl p-6 border-l-4 border-purple-500">
          <h2 className="text-gray-500 mb-1">Registered Events</h2>
          <p className="text-3xl font-bold">{registeredEvents.length}</p>
        </div>

        <div className="bg-white shadow rounded-xl p-6 border-l-4 border-green-500">
          <h2 className="text-gray-500 mb-1">Paid Tickets</h2>
          <p className="text-3xl font-bold">{paidTicketsCount}</p>
        </div>

        <div className="bg-white shadow rounded-xl p-6 border-l-4 border-gray-500">
          <h2 className="text-gray-500 mb-1">Used Tickets</h2>
          <p className="text-3xl font-bold">{usedTickets.length}</p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Quick Links</h2>
          <div className="bg-white shadow rounded-xl p-6 space-y-4">
             <Link to="/my-tickets" className="block p-4 border rounded hover:bg-slate-50">
               <div className="font-semibold text-lg text-blue-600">My Tickets</div>
               <div className="text-sm text-gray-500">View your QR codes and booked tickets.</div>
             </Link>
             <Link to="/events" className="block p-4 border rounded hover:bg-slate-50">
               <div className="font-semibold text-lg text-green-600">Discover Events</div>
               <div className="text-sm text-gray-500">Find new events in your college.</div>
             </Link>
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold mb-4">Recent Registrations</h2>
          <div className="bg-white shadow rounded-xl p-6">
            {registeredEvents.length === 0 ? (
              <div className="text-gray-500 text-center py-4">No events registered yet.</div>
            ) : (
              <ul className="space-y-4">
                {registeredEvents.slice(0, 3).map(event => (
                   <li key={event._id} className="border-b pb-2 last:border-0 last:pb-0">
                     <div className="font-semibold">{event.title}</div>
                     <div className="text-sm text-gray-500">{new Date(event.eventDate).toLocaleDateString()}</div>
                   </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;