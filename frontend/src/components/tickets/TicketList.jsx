import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import useAuth from "../../hooks/useAuth";
import { getMyTickets } from "../../services/ticketService";
import TicketCard from "./TicketCard";

function TicketList() {
  const { token } = useAuth();

  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    fetchTickets();
  }, []);

  async function fetchTickets() {
    try {
      const data = await getMyTickets(token);
      setTickets(data);
    } catch (error) {
      toast.error("Unable to load tickets");
    }
  }

  if (tickets.length === 0) {
    return (
      <h2 className="text-center text-2xl mt-10">
        No Tickets Found
      </h2>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8 grid md:grid-cols-2 gap-6">
      {tickets.map((ticket) => (
        <TicketCard
          key={ticket._id}
          ticket={ticket}
        />
      ))}
    </div>
  );
}

export default TicketList;