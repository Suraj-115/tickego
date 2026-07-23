import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { createOrder, verifyPayment } from "../../services/paymentService";

import { getEventById, registerForEvent } from "../../services/eventService";
import useAuth from "../../hooks/useAuth";

function EventDetailsCard() {
  const { id } = useParams();
  const { token } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvent();
  }, []);

  async function fetchEvent() {
    try {
      const data = await getEventById(id);
      setEvent(data);
    } catch (error) {
      toast.error("Unable to load event");
    } finally {
      setLoading(false);
    }
  }

  const handleRegister = async () => {
    if (!token) {
      toast.error("Please login first");
      return;
    }

    if (!event.isPaid) {
      try {
        const response = await registerForEvent(id, token);
        toast.success(response.message);
        fetchEvent();
      } catch (error) {
        toast.error(error.response?.data?.message || "Registration failed");
      }

      return;
    }

    try {
      const orderData = await createOrder(id, token);

      const options = {
        key: orderData.key,

        amount: orderData.order.amount,

        currency: orderData.order.currency,

        name: "TickeGo",

        description: event.title,

        order_id: orderData.order.id,

        handler: async function (response) {
          try {
            await verifyPayment(
              {
                razorpay_order_id: response.razorpay_order_id,

                razorpay_payment_id: response.razorpay_payment_id,

                razorpay_signature: response.razorpay_signature,

                ticketId: orderData.ticketId,
              },
              token,
            );

            toast.success("Payment Successful");

            window.location.href = "/my-tickets";
          } catch (err) {
            toast.error("Payment Verification Failed");
          }
        },

        theme: {
          color: "#2563eb",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.open();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to create order");
    }
  };

  if (loading) return <h2 className="text-center mt-10">Loading...</h2>;

  if (!event) return <h2 className="text-center mt-10">Event not found</h2>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      {event.poster && (
        <img
          src={event.poster}
          alt={event.title}
          className="w-full h-80 object-cover rounded-xl mb-6"
        />
      )}

      <h1 className="text-4xl font-bold">{event.title}</h1>

      <p className="mt-4">{event.description}</p>

      <div className="grid md:grid-cols-2 gap-4 mt-8">
        <p>
          <strong>Category:</strong> {event.category}
        </p>

        <p>
          <strong>Mode:</strong> {event.eventMode}
        </p>

        <p>
          <strong>Date:</strong> {new Date(event.eventDate).toLocaleString()}
        </p>

        <p>
          <strong>City:</strong> {event.location?.city}
        </p>

        <p>
          <strong>Address:</strong> {event.location?.address}
        </p>

        <p>
          <strong>Organization:</strong> {event.organization?.name}
        </p>

        <p>
          <strong>Department:</strong> {event.department?.name || "-"}
        </p>

        <p>
          <strong>Participants:</strong> {event.registeredUsers.length}
          {event.maxParticipants ? ` / ${event.maxParticipants}` : ""}
        </p>

        <p>
          <strong>Price:</strong>{" "}
          {event.isPaid ? `₹${event.ticketPrice}` : "Free"}
        </p>
      </div>

      <button
        onClick={handleRegister}
        className="mt-8 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
      >
        {event.isPaid
  ? `Buy Ticket ₹${event.ticketPrice}`
  : "Register"}
      </button>
    </div>
  );
}

export default EventDetailsCard;
