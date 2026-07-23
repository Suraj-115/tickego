import api from "./api";

export const createOrder = async (eventId, token) => {
  const response = await api.post(
    "/payment/create-order",
    { eventId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const verifyPayment = async (data, token) => {
  const response = await api.post(
    "/payment/verify",
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};