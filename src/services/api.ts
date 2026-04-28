import axios, {
	AxiosInstance,
	AxiosError,
	InternalAxiosRequestConfig,
} from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3030";

const api: AxiosInstance = axios.create({
	baseURL: BASE_URL,
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
});

// Attach token to every request if available
api.interceptors.request.use(
	async (config: InternalAxiosRequestConfig) => {
		const token = await AsyncStorage.getItem("auth_token");
		if (token && config.headers) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error: AxiosError) => Promise.reject(error),
);

// Clear storage on 401
api.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		if (error.response?.status === 401) {
			await AsyncStorage.multiRemove(["auth_token", "auth_user"]);
		}
		return Promise.reject(error);
	},
);

// Shared error handler used by all services
export const handleError = (error: unknown): never => {
	if (error instanceof AxiosError) {
		const status = error.response?.status;
		const msg = error.response?.data?.message;

		if (status === 400) throw new Error(msg ?? "Invalid request.");
		if (status === 401) throw new Error("Session expired. Please login again.");
		if (status === 403) throw new Error("You are not authorized.");
		if (status === 404) throw new Error("Not found.");
		if (status === 500)
			throw new Error("Server error. Please try again later.");
		if (msg) throw new Error(msg);
		if (error.code === "ECONNABORTED") throw new Error("Request timed out.");
	}
	throw new Error("An unexpected error occurred.");
};

export default api;
