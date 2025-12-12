import httpClient from "./httpClient";

export const listeningApi = {
  getExercises: async () => {
    const res = await httpClient.get("/listening");
    return res.data;
  },
};
