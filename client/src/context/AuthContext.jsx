import {
	createContext,
	useContext,
	useEffect,
	useState,
	useCallback,
} from "react";
import api, { setAccessToken, clearAccessToken } from "../api/api";

const USER_KEY = "washly_user";

const AuthContext = createContext(null);

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
	return ctx;
}

export function AuthProvider({ children }) {
	const [user, setUser] = useState(() => {
		try {
			return JSON.parse(localStorage.getItem(USER_KEY)) || null;
		} catch {
			return null;
		}
	});

	// FIX: se exporta como `isLoading` para consistencia con App.jsx
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
		else localStorage.removeItem(USER_KEY);
	}, [user]);

	const tryRestoreSession = useCallback(async () => {
		try {
			const data = await api.post("/auth/refresh");
			setAccessToken(data.accessToken);
			setUser(data.lavadero);
		} catch (err) {
			// Diferenciar error de red vs token expirado
			const isNetworkError =
				err.message?.toLowerCase().includes("failed to fetch") ||
				err.message?.toLowerCase().includes("network") ||
				err.message?.toLowerCase().includes("timeout");

			if (isNetworkError) {
				// Sin conexión: mantener usuario en localStorage para UX
				// pero limpiar el token en memoria (se refrescará cuando vuelva la red)
				clearAccessToken();
			} else {
				// Token expirado o inválido: limpiar todo
				clearAccessToken();
				setUser(null);
			}
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		tryRestoreSession();

		function onSessionExpired() {
			clearAccessToken();
			setUser(null);
		}

		window.addEventListener("auth:session_expired", onSessionExpired);
		return () =>
			window.removeEventListener("auth:session_expired", onSessionExpired);
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
		try {
			await api.post("/auth/logout");
		} catch {
			// best effort
		} finally {
			clearAccessToken();
			setUser(null);
		}
	}

	function updateUser(patch) {
		setUser((prev) => ({ ...prev, ...patch }));
	}

	const value = {
		user,
		isAuthenticated: !!user,
		isLoading,          // FIX: nombre consistente
		loading: isLoading, // alias de compatibilidad por si algún componente usa "loading"
		login,
		signup,
		logout,
		updateUser,
	};

	if (isLoading) return null;

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
}