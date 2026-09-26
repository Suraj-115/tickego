import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { getAllEvents } from "../../services/eventService";
import EventCard from "./EventCard";

function EventsList() {
  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState({
    title: "",
    category: "",
    eventMode: "",
    isPaid: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [filters.category, filters.eventMode, filters.isPaid]); // Fetch on dropdown change

  async function fetchEvents() {
    try {
      setLoading(true);
      // Clean up empty params
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "")
      );
      const data = await getAllEvents(params);
      setEvents(data);
    } catch (error) {
      toast.error("Unable to load events");
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <h1 className="text-4xl font-bold mb-8 text-center md:text-left">
        Discover College Events
      </h1>

      <div className="bg-white p-4 rounded-xl shadow mb-8">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            name="title"
            placeholder="Search events by name..."
            className="flex-1 border p-3 rounded"
            value={filters.title}
            onChange={handleFilterChange}
          />
          <select 
            name="category" 
            value={filters.category} 
            onChange={handleFilterChange}
            className="border p-3 rounded bg-white"
          >
            <option value="">All Categories</option>
            <option value="workshop">Workshop</option>
            <option value="hackathon">Hackathon</option>
            <option value="concert">Concert</option>
            <option value="recruitment">Recruitment</option>
            <option value="seminar">Seminar</option>
            <option value="sports">Sports</option>
            <option value="other">Other</option>
          </select>

          <select 
            name="eventMode" 
            value={filters.eventMode} 
            onChange={handleFilterChange}
            className="border p-3 rounded bg-white"
          >
            <option value="">All Modes</option>
            <option value="offline">Offline</option>
            <option value="online">Online</option>
            <option value="hybrid">Hybrid</option>
          </select>

          <select 
            name="isPaid" 
            value={filters.isPaid} 
            onChange={handleFilterChange}
            className="border p-3 rounded bg-white"
          >
            <option value="">Price (All)</option>
            <option value="false">Free</option>
            <option value="true">Paid</option>
          </select>

          <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded shadow hover:bg-blue-700">
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="text-center p-8 text-gray-500">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="text-center p-8 text-gray-500 bg-white rounded-xl shadow">
          No events found matching your criteria.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default EventsList;