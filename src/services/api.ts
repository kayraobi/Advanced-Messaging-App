import axios, {
	AxiosInstance,
	AxiosError,
	InternalAxiosRequestConfig,
} from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

const getLanHostFromExpo = (): string | null => {
	const hostUri = Constants.expoConfig?.hostUri;
	if (!hostUri) return null;
	const [host] = hostUri.split(":");
	return host || null;
};

const getDefaultApiUrl = (): string => {
	// Must match backend `PORT` (default 3000 in backend/src/index.ts).
	// Android emulator cannot reach host machine via localhost.
	if (Platform.OS === "android" && !Constants.isDevice) return "http://10.0.2.2:3000";
	const lanHost = getLanHostFromExpo();
	if (lanHost) return `http://${lanHost}:3000`;
	return "http://localhost:3000";
};

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? getDefaultApiUrl();
export const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === "true";

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

// Clear storage on 401 (not on failed login/register — wrong password is still 401)
api.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		if (error.response?.status === 401) {
			const url = `${error.config?.baseURL ?? ""}${error.config?.url ?? ""}`;
			const isAuthAttempt =
				/\/login\b/i.test(url) || /\/register\b/i.test(url);
			if (!isAuthAttempt) {
				await AsyncStorage.multiRemove(["auth_token", "auth_user"]);
			}
		}
		return Promise.reject(error);
	},
);

function stringifyApiMessage(data: unknown): string | undefined {
	if (data === null || data === undefined) return undefined;
	if (typeof data === "string") return data;
	if (typeof data === "object") {
		const o = data as Record<string, unknown>;
		const m = o.message ?? o.error;
		if (typeof m === "string") return m;
		if (Array.isArray(m) && typeof m[0] === "string") return m.join(" ");
	}
	return undefined;
}

// Shared error handler used by all services
export const handleError = (error: unknown): never => {
	if (error instanceof AxiosError) {
		if (!error.response) {
			if (error.code === "ECONNABORTED")
				throw new Error("Request timed out.");
			throw new Error(
				`Cannot reach API at ${BASE_URL}. Start the backend (${error.code ?? "network"}). Set EXPO_PUBLIC_API_URL if using another host.`,
			);
		}

		const status = error.response.status;
		const msg = stringifyApiMessage(error.response.data);

		if (status === 400) throw new Error(msg ?? "Invalid request.");
		if (status === 401)
			throw new Error(
				msg ?? "Session expired. Please login again.",
			);
		if (status === 403) throw new Error("You are not authorized.");
		if (status === 404) throw new Error(msg ?? "Not found.");
		if (status >= 500)
			throw new Error(msg ?? "Server error. Please try again later.");
		if (msg) throw new Error(msg);
	}
	throw new Error("An unexpected error occurred.");
};

export default api;
