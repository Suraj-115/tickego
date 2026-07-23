import { Link } from "react-router-dom";

function EventCard({ event }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Event Poster */}
      {event.poster && (
        <img
          src={event.poster}
          alt={event.title}
          className="w-full h-48 object-cover"
        />
      )}

      <div className="p-6">
        <h2 className="text-2xl font-bold">
          {event.title}
        </h2>

        <p className="text-gray-600 mt-2">
          {event.category}
        </p>

        <p className="mt-2">
          📍 {event.location?.city || "Location not specified"}
        </p>

        <p>
          📅 {new Date(event.eventDate).toLocaleDateString()}
        </p>

        <p>
          💰 {event.isPaid ? `₹${event.ticketPrice}` : "Free"}
        </p>

        <Link
          to={`/events/${event._id}`}
          className="inline-block mt-5 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

export default EventCard;