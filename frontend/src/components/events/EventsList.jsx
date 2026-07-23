import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { getAllEvents } from "../../services/eventService";
import EventCard from "./EventCard";

function EventsList() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const data = await getAllEvents();
      setEvents(data);
    } catch (error) {
      toast.error("Unable to load events");
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">
        Upcoming Events
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard
            key={event._id}
            event={event}
          />
        ))}
      </div>
    </div>
  );
}

export default EventsList;