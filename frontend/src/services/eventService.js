import api from "./api";

export const getAllEvents = async (params = {}) => {
  const response = await api.get("/event", { params });
  return response.data;
};

export const getEventById = async (id) => {
  const response = await api.get(`/event/${id}`);
  return response.data;
};

export const createEvent = async (data, token) => {
  const response = await api.post("/event/create", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const registerForEvent = async (id, token) => {
  const response = await api.post(
    `/event/register/${id}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};