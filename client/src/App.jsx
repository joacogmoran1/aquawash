import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
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
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				minHeight: "100vh",
				backgroundColor: "var(--bg)",
			}}
		>
			<div style={{ textAlign: "center", color: "var(--muted)" }}>
				Cargando…
			</div>
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
			<Route path="/dashboard" element={<DashboardPage showToast={showToast} />} />
			<Route path="/calendar" element={<CalendarPage showToast={showToast} />} />
			<Route path="/clients" element={<ClientsPage showToast={showToast} />} />
			<Route path="/config" element={<ConfigPage showToast={showToast} />} />
			<Route path="*" element={<Navigate to="/dashboard" replace />} />
		</Routes>
	);
}

function AppShell() {
	const { user, isLoading } = useAuth();
	const [toast, setToast] = useState(null);

	function showToast(msg, type = "success") {
		setToast({ msg, type });
	}

	if (isLoading) {
		return <FullscreenLoader />;
	}

	if (!user) {
		return <AuthRoutes />;
	}

	return (
		<div className="app">
			<Sidebar />

			<main className="main">
				<AppRoutes showToast={showToast} />
			</main>

			{toast && (
				<Toast
					msg={toast.msg}
					type={toast.type}
					onClose={() => setToast(null)}
				/>
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