import api from "./api";

export const getAllDepartments = async () => {
  const response = await api.get("/dept");
  return response.data;
};