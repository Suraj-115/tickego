function TicketCard({ ticket }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">

      <h2 className="text-2xl font-bold">
        {ticket.event.title}
      </h2>

      <p className="mt-2">
        📅{" "}
        {new Date(ticket.event.eventDate).toLocaleDateString()}
      </p>

      <p>
        📍 {ticket.event.location?.city}
      </p>

      <p>
        🎟 Ticket No:
        {" "}
        {ticket.ticketNumber}
      </p>

      <p>
        Payment:
        {" "}
        <span className="font-semibold">
          {ticket.status}
        </span>
      </p>

      <p>
        Used:
        {" "}
        {ticket.isUsed ? "✅ Yes" : "❌ No"}
      </p>

      {ticket.qrCode && (
        <img
          src={ticket.qrCode}
          alt="QR Code"
          className="w-48 mt-4"
        />
      )}
    </div>
  );
}

export default TicketCard;