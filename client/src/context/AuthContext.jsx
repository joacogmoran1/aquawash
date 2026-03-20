import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import api, { setAccessToken, clearAccessToken } from "../api/api";

const USER_KEY = "washly_user";
const AuthContext = createContext(null);

// FIX: flag de módulo para evitar doble refresh en StrictMode
let _refreshing = false;

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
	return ctx;
}

export function AuthProvider({ children }) {
	const [user, setUser] = useState(() => {
		try { return JSON.parse(localStorage.getItem(USER_KEY)) || null; }
		catch { return null; }
	});
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
		else localStorage.removeItem(USER_KEY);
	}, [user]);

	const tryRestoreSession = useCallback(async () => {
		// FIX: si ya hay un refresh en curso (StrictMode doble ejecución), salir
		if (_refreshing) return;
		_refreshing = true;

		try {
			const data = await api.post("/auth/refresh");
			setAccessToken(data.accessToken);
			setUser(data.lavadero);
		} catch (err) {
			const isNetwork =
				err.message?.toLowerCase().includes("failed to fetch") ||
				err.message?.toLowerCase().includes("network") ||
				err.message?.toLowerCase().includes("tardó demasiado");
			clearAccessToken();
			if (!isNetwork) setUser(null);
		} finally {
			setIsLoading(false);
			_refreshing = false;
		}
	}, []);

	useEffect(() => {
		tryRestoreSession();
		const onExpired = () => { clearAccessToken(); setUser(null); };
		window.addEventListener("auth:session_expired", onExpired);
		return () => window.removeEventListener("auth:session_expired", onExpired);
	}, [tryRestoreSession]);

	async function login({ email, password }) {
		const data = await api.post("/auth/login", { email, password });
		setAccessToken(data.accessToken);
		setUser(data.lavadero);
		return data;
	}

	async function signup(formData) {
		const { confirm, ...body } = formData;
		await api.post("/auth/register", body);
	}

	async function logout() {
		try { await api.post("/auth/logout"); } catch { }
		finally { clearAccessToken(); setUser(null); }
	}

	const updateUser = (patch) => setUser((prev) => ({ ...prev, ...patch }));

	return (
		<AuthContext.Provider value={{
			user, isAuthenticated: !!user,
			isLoading, loading: isLoading,
			login, signup, logout, updateUser,
		}}>
			{children}
		</AuthContext.Provider>
	);
}