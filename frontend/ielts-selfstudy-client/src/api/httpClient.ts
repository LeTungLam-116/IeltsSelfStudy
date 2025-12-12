import axios from "axios";

const httpClient = axios.create({
  baseURL: "https://localhost:7295/api",
  withCredentials: false,
});

export default httpClient;
