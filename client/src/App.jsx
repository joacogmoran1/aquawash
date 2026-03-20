import { useState, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";
import { Sidebar } from "./components/SideBar/Sidebar";
import { Toast } from "./components/Toast/Toast";
import { LoginPage } from "./pages/LoginPage/LoginPage";
import { SignupPage } from "./pages/SignupPage/SignupPage";
import { DashboardPage } from "./pages/DashboardPage/DashboardPage";
import { CalendarPage } from "./pages/CalendarPage/CalendarPage";
import { ClientsPage } from "./pages/ClientsPage/ClientsPage";
import { ConfigPage } from "./pages/ConfigPage/ConfigPage";
import { CSS } from "./utils/theme";

function FullscreenLoader() {
	return (
		<div style={{
			display: "flex", alignItems: "center", justifyContent: "center",
			minHeight: "100vh", backgroundColor: "var(--bg)"
		}}>
			<div style={{ color: "var(--muted)" }}>Cargando…</div>
		</div>
	);
}

function AuthRoutes() {
	return (
		<Routes>
			<Route path="/login" element={<LoginPage />} />
			<Route path="/signup" element={<SignupPage />} />
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
	const { user, isLoading } = useAuth();
	const [toast, setToast] = useState(null);

	// FIX #18: referencia estable — no dispara re-ejecución de useEffect
	const showToast = useCallback((msg, type = "success") => {
		setToast({ msg, type });
	}, []);

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