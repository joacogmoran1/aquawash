import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./LoginPage.module.css";

export function LoginPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const { login } = useAuth();

	const justRegistered = location.state?.registered;

	const [email, setEmail] = useState("");
	const [pass, setPass] = useState("");
	const [err, setErr] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleSubmit() {
		if (!email || !pass) {
			setErr("Completá todos los campos.");
			return;
		}

		setErr("");
		setLoading(true);

		try {
			await login({ email, password: pass });
			navigate("/dashboard", { replace: true });
		} catch (e) {
			setErr(e.message || "Error al iniciar sesión.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className={styles.authPage}>
			<div className={styles.authLeft}>
				<div className={styles.authBgPattern} />

				<div className={styles.authBrand}>
					<div className={styles.authBrandName}>AQUAWASH</div>
					<div className={styles.authBrandTagline}>
						Sistema integral para lavaderos
					</div>
				</div>

				<div className={styles.authFeatures}>
					{[
						["💧", "Gestión de órdenes en tiempo real"],
						["📅", "Agenda de turnos inteligente"],
						["👥", "Base de clientes centralizada"],
						["📊", "Métricas e ingresos al instante"],
					].map(([ic, tx]) => (
						<div className={styles.authFeature} key={tx}>
							<div className={styles.authFeatureIcon}>{ic}</div>
							<div className={styles.authFeatureText}>{tx}</div>
						</div>
					))}
				</div>

				<div className={styles.authBigText}>WASH</div>
			</div>

			<div className={styles.authRight}>
				<div className={styles.authFormBox}>
					<div className={styles.authTitle}>Bienvenido</div>
					<div className={styles.authSubtitle}>
						Ingresá a tu cuenta para continuar
					</div>

					{justRegistered && (
						<div className={styles.successText}>
							¡Cuenta creada exitosamente! Iniciá sesión para continuar.
						</div>
					)}

					<div className={styles.authForm}>
						<div className={styles.inputGroup}>
							<div className={styles.inputLabel}>Email</div>
							<input
								className={styles.input}
								type="email"
								placeholder="lavadero@email.com"
								value={email}
								onChange={(e) => { setEmail(e.target.value); if (err) setErr(""); }}
							/>
						</div>

						<div className={styles.inputGroup}>
							<div className={styles.inputLabel}>Contraseña</div>
							<input
								className={styles.input}
								type="password"
								placeholder="••••••••"
								value={pass}
								onChange={(e) => { setPass(e.target.value); if (err) setErr(""); }}
								onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
							/>
						</div>

						{err && <div className={styles.errorText}>{err}</div>}

						<button
							className={styles.primaryButton}
							onClick={handleSubmit}
							disabled={loading}
						>
							{loading ? "Ingresando…" : "Iniciar sesión"}
						</button>
					</div>

					<div className={styles.authSwitch}>
						¿No tenés cuenta?{" "}
						<span
							className={styles.authLink}
							onClick={() => navigate("/signup")}
						>
							Registrate
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}