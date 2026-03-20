import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api, { setAccessToken, clearAccessToken } from "../api/api";

const USER_KEY = "washly_user_cache";
const AuthContext = createContext(null);

let _refreshing = false;

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
	return ctx;
}

export function AuthProvider({ children }) {
	// user === null  → no autenticado (o cargando)
	// user === objeto → autenticado con datos frescos del servidor
	const [user, setUser] = useState(null);

	// Cache SOLO para mostrar nombre/datos en el loader mientras se valida la sesión.
	// NUNCA se usa para decidir si el usuario está autenticado.
	const [cachedUser, setCachedUser] = useState(() => {
		try { return JSON.parse(localStorage.getItem(USER_KEY)) || null; }
		catch { return null; }
	});

	const [isLoading, setIsLoading] = useState(true);

	// Sincronizar cache cuando cambia el usuario real
	useEffect(() => {
		if (user) {
			localStorage.setItem(USER_KEY, JSON.stringify(user));
			setCachedUser(user);
		} else {
			localStorage.removeItem(USER_KEY);
			setCachedUser(null);
		}
	}, [user]);

	const tryRestoreSession = useCallback(async () => {
		if (_refreshing) return;
		_refreshing = true;

		try {
			const data = await api.post("/auth/refresh");
			setAccessToken(data.accessToken);
			setUser(data.lavadero); // ← datos frescos del servidor, no del localStorage
		} catch (err) {
			const isNetwork =
				err.message?.toLowerCase().includes("failed to fetch") ||
				err.message?.toLowerCase().includes("network") ||
				err.message?.toLowerCase().includes("tardó demasiado");
			clearAccessToken();
			// Si es error de red, no limpiamos el user para no romper UX offline
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

	const updateUser = (patch) => setUser((prev) => prev ? { ...prev, ...patch } : null);

	return (
		<AuthContext.Provider value={{
			// user viene del servidor. Durante la carga inicial mostramos el cache
			// para el nombre/avatar, pero isLoading=true indica que no está confirmado.
			user: user ?? (isLoading ? cachedUser : null),
			isAuthenticated: !!user, // ← SOLO true si viene del servidor
			isLoading,
			loading: isLoading,
			login, signup, logout, updateUser,
		}}>
			{children}
		</AuthContext.Provider>
	);
}