import api from "./api";

export const getAllOrganizations = async () => {
  const response = await api.get("/org");
  return response.data;
};