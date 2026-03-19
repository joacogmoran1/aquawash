import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Context
import { useAuth } from "../../context/AuthContext";

// Components
import { Icon } from "../Icon/Icon";

// Utils
import { initials } from "../../utils/dateUtils";
import { NAV } from "../../utils/constants";

// Style
import styles from "./Sidebar.module.css";


export function Sidebar() {
	const navigate = useNavigate();
	const location = useLocation();
	const { user, logout } = useAuth();
	const [mobileOpen, setMobileOpen] = useState(false);

	function handleNav(path) {
		navigate(path);
		setMobileOpen(false);
	}

	function handleLogout() {
		setMobileOpen(false);
		logout();
	}

	// Cerrar al cambiar de ruta
	useEffect(() => {
		setMobileOpen(false);
	}, [location.pathname]);

	// Cerrar al ampliar la pantalla
	useEffect(() => {
		function handleResize() {
			if (window.innerWidth > 768) setMobileOpen(false);
		}
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return (
		<>
			<button
				className={`${styles.mobileMenuBtn} ${mobileOpen ? styles.mobileMenuBtnActive : ""}`}
				onClick={() => setMobileOpen((prev) => !prev)}
				aria-label="Menú"
			>
				<Icon name={mobileOpen ? "x" : "dashboard"} size={18} />
			</button>

			{mobileOpen && (
				<div
					className={styles.sidebarOverlay}
					onClick={() => setMobileOpen(false)}
				/>
			)}

			<aside className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ""}`}>
				<div className={styles.sidebarLogo}>
					<div className={styles.logoRow}>
						<div className={styles.logoBlock}>
							<div className={styles.logoMark}>
								AQUA<span className={styles.logoMarkAccent}>WASH</span>
							</div>
							<div className={styles.logoSub}>Sistema de gestión</div>
						</div>
					</div>
				</div>

				<nav className={styles.sidebarNav}>
					{NAV.map((n) => {
						// FIX: comparar contra n.path, no contra `/${n.id}`
						const isActive = location.pathname === n.path;

						return (
							<button
								key={n.id}
								type="button"
								className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
								onClick={() => handleNav(n.path)}
								aria-current={isActive ? "page" : undefined}
							>
								<Icon name={n.icon} size={16} />
								<span>{n.label}</span>
							</button>
						);
					})}
				</nav>

				<div className={styles.sidebarFooter}>
					<div className={styles.userChip}>
						<div className={styles.userAvatar}>
							{initials(user?.nombre || "?")}
						</div>
						<div className={styles.userInfo}>
							<div className={styles.userName}>{user?.nombre || "Lavadero"}</div>
							<div className={styles.userRole}>Propietario</div>
						</div>
					</div>

					<button className={styles.logoutBtn} onClick={handleLogout} type="button">
						<Icon name="logout" size={15} />
						<span>Cerrar sesión</span>
					</button>
				</div>
			</aside>
		</>
	);
}