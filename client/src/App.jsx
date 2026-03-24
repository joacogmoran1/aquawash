import { useState, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

// Context
import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import { LoginPage } from "./pages/LoginPage/LoginPage";
import { SignupPage } from "./pages/SignupPage/SignupPage";
import { VerifyEmailPage } from "./pages/VerifyEmailPage/VerifyEmailPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage/ResetPasswordPage";
import { DashboardPage } from "./pages/DashboardPage/DashboardPage";
import { CalendarPage } from "./pages/CalendarPage/CalendarPage";
import { ClientsPage } from "./pages/ClientsPage/ClientsPage";
import { ConfigPage } from "./pages/ConfigPage/ConfigPage";
import { BookingPage } from "./pages/BookingPage/BookingPage";   // ← nueva página pública

// Components
import { PageLoading } from "./components/PageLoading/PageLoading";
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";
import { Sidebar } from "./components/SideBar/Sidebar";
import { Toast } from "./components/Toast/Toast";

// Utils
import { CSS } from "./utils/theme";



function FullscreenLoader() {
	return <PageLoading text="Cargando datos…" fullscreen />;
}

function PublicAuthRoutes() {
	return (
		<Routes>
			<Route path="/verify-email" element={<VerifyEmailPage />} />
			<Route path="/reset-password" element={<ResetPasswordPage />} />
		</Routes>
	);
}

/** Rutas de reserva pública — sin autenticación, sin sidebar */
function PublicBookingRoutes() {
	return (
		<Routes>
			<Route path="/book/:lavaderoId" element={<BookingPage />} />
		</Routes>
	);
}

function AuthRoutes() {
	return (
		<Routes>
			<Route path="/login" element={<LoginPage />} />
			<Route path="/signup" element={<SignupPage />} />
			<Route path="/verify-email" element={<VerifyEmailPage />} />
			<Route path="/reset-password" element={<ResetPasswordPage />} />
			<Route path="*" element={<Navigate to="/login" replace />} />
		</Routes>
	);
}

function AppRoutes({ showToast }) {
	return (
		<Routes>
			<Route path="/dashboard" element={<ErrorBoundary><DashboardPage showToast={showToast} /></ErrorBoundary>} />
			<Route path="/calendar" element={<ErrorBoundary><CalendarPage showToast={showToast} /></ErrorBoundary>} />
			<Route path="/clients" element={<ErrorBoundary><ClientsPage showToast={showToast} /></ErrorBoundary>} />
			<Route path="/config" element={<ErrorBoundary><ConfigPage showToast={showToast} /></ErrorBoundary>} />
			<Route path="*" element={<Navigate to="/dashboard" replace />} />
		</Routes>
	);
}

function AppShell() {
	const location = useLocation();
	const { user, isLoading } = useAuth();
	const [toast, setToast] = useState(null);

	const showToast = useCallback((msg, type = "success") => {
		setToast({ msg, type });
	}, []);

	// ── Rutas completamente públicas (sin layout) ──────────────────────────
	if (["/verify-email", "/reset-password"].includes(location.pathname)) {
		return <PublicAuthRoutes />;
	}

	// ── Página de reservas online (accesible sin cuenta) ───────────────────
	if (location.pathname.startsWith("/book/")) {
		return <PublicBookingRoutes />;
	}

	// ── App autenticada ────────────────────────────────────────────────────
	if (isLoading) return <FullscreenLoader />;
	if (!user) return <AuthRoutes />;

	return (
		<div className="app">
			<ErrorBoundary fallback={
				<div style={{ padding: 24, color: "var(--red)" }}>
					Error en la barra lateral — recargá la página.
				</div>
			}>
				<Sidebar />
			</ErrorBoundary>

			<main className="main">
				<AppRoutes showToast={showToast} />
			</main>

			{toast && (
				<Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
			)}
		</div>
	);
}

export default function App() {
	return (
		<>
			<style>{CSS}</style>
			<BrowserRouter>
				<AuthProvider>
					<AppShell />
				</AuthProvider>
			</BrowserRouter>
		</>
	);
}