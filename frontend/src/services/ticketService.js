import api from "./api";

export const getMyTickets = async (token) => {
  const response = await api.get("/ticket/my-tickets", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};