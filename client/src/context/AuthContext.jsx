import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api, { setAccessToken, clearAccessToken } from "../api/api";

// ── Solo datos NO sensibles en localStorage ──────────────────
// Nunca guardar el access token aquí (vulnerable a XSS)
// El refresh token lo maneja el servidor via httpOnly cookie
const USER_KEY = "washly_user";

const AuthContext = createContext(null);

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
	return ctx;
}

export function AuthProvider({ children }) {
	// Solo nombre, email, id — nada sensible
	const [user, setUser] = useState(() => {
		try { return JSON.parse(localStorage.getItem(USER_KEY)) || null; }
		catch { return null; }
	});
	// true mientras se intenta restaurar la sesión al iniciar
	const [loading, setLoading] = useState(true);

	// Persistir solo datos del perfil (sin token)
	useEffect(() => {
		if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
		else localStorage.removeItem(USER_KEY);
	}, [user]);

	// ── Restaurar sesión al iniciar la app ───────────────────
	// Usa la httpOnly cookie para obtener un nuevo access token
	const tryRestoreSession = useCallback(async () => {
		try {
			const data = await api.post("/auth/refresh");
			setAccessToken(data.accessToken);
			setUser(data.lavadero);
		} catch {
			// Cookie expirada o no existe → limpiar sesión
			clearAccessToken();
			setUser(null);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		tryRestoreSession();

		// Escuchar logout forzado (cuando el refresh falla mid-session)
		function onSessionExpired() {
			clearAccessToken();
			setUser(null);
		}

		window.addEventListener('auth:session_expired', onSessionExpired);
		return () => window.removeEventListener('auth:session_expired', onSessionExpired);
	}, [tryRestoreSession]);

	// ── Login ────────────────────────────────────────────────
	async function login({ email, password }) {
		const data = await api.post("/auth/login", { email, password });
		setAccessToken(data.accessToken);
		setUser(data.lavadero);
		return data;
	}

	// ── Registro ─────────────────────────────────────────────
	async function signup(formData) {
		const { confirm, ...body } = formData;
		await api.post("/auth/register", body);
	}

	// ── Logout ───────────────────────────────────────────────
	async function logout() {
		try {
			// Revocar el refresh token en el servidor y limpiar cookie
			await api.post("/auth/logout");
		} catch {
			// Best effort — limpiar localmente de todas formas
		} finally {
			clearAccessToken();
			setUser(null);
		}
	}

	// ── Actualizar datos del perfil localmente ───────────────
	function updateUser(patch) {
		setUser(prev => ({ ...prev, ...patch }));
	}

	const value = {
		user,
		isAuthenticated: !!user,
		loading,
		login,
		signup,
		logout,
		updateUser,
	};

	// No renderizar la app hasta saber si hay sesión activa
	if (loading) return null;

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	);
}
