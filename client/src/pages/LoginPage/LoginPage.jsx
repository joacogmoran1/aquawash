import { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "../../styles/LoginPage.module.css";

export function LoginPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const { login, forgotPassword, resendVerification } = useAuth();

	const justRegistered = location.state?.registered;
	const initialEmail = location.state?.email || "";

	const [email, setEmail] = useState(initialEmail);
	const [pass, setPass] = useState("");
	const [err, setErr] = useState("");
	const [loading, setLoading] = useState(false);
	const [recoveryEmail, setRecoveryEmail] = useState(initialEmail);
	const [recoveryLoading, setRecoveryLoading] = useState(false);
	const [recoveryMessage, setRecoveryMessage] = useState("");
	const [recoveryError, setRecoveryError] = useState("");
	const [verificationLoading, setVerificationLoading] = useState(false);
	const [verificationMessage, setVerificationMessage] = useState("");
	const [verificationError, setVerificationError] = useState("");

	const canResendVerification = useMemo(
		() => recoveryEmail.trim().length > 0,
		[recoveryEmail]
	);

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

	async function handleForgotPassword() {
		if (!recoveryEmail.trim()) {
			setRecoveryError("Ingresá tu email para recuperar la contraseña.");
			return;
		}

		setRecoveryError("");
		setRecoveryMessage("");
		setRecoveryLoading(true);

		try {
			const data = await forgotPassword(recoveryEmail.trim().toLowerCase());
			setRecoveryMessage(data.message || "Revisá tu email para continuar con el cambio.");
		} catch (e) {
			setRecoveryError(e.message || "No se pudo enviar el email de recuperación.");
		} finally {
			setRecoveryLoading(false);
		}
	}

	async function handleResendVerification() {
		if (!recoveryEmail.trim()) {
			setVerificationError("Ingresá tu email para reenviar la verificación.");
			return;
		}

		setVerificationError("");
		setVerificationMessage("");
		setVerificationLoading(true);

		try {
			const data = await resendVerification(recoveryEmail.trim().toLowerCase());
			setVerificationMessage(data.message || "Revisá tu email para verificar la cuenta.");
		} catch (e) {
			setVerificationError(e.message || "No se pudo reenviar la verificación.");
		} finally {
			setVerificationLoading(false);
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
							¡Cuenta creada exitosamente! Verificá tu email para activar la cuenta.
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
								onChange={(e) => {
									setEmail(e.target.value);
									setRecoveryEmail(e.target.value);
									if (err) setErr("");
								}}
							/>
						</div>

						<div className={styles.inputGroup}>
							<div className={styles.inputLabel}>Contraseña</div>
							<input
								className={styles.input}
								type="password"
								placeholder="••••••••"
								value={pass}
								onChange={(e) => {
									setPass(e.target.value);
									if (err) setErr("");
								}}
								onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
							/>
						</div>

						<div className={styles.inlineActions}>
							<button
								type="button"
								className={styles.inlineActionButton}
								onClick={handleForgotPassword}
								disabled={recoveryLoading}
							>
								{recoveryLoading ? "Enviando recuperación…" : "¿Olvidaste tu contraseña?"}
							</button>
							<button
								type="button"
								className={styles.inlineActionButton}
								onClick={handleResendVerification}
								disabled={!canResendVerification || verificationLoading}
							>
								{verificationLoading ? "Enviando verificación…" : "Reenviar verificación"}
							</button>
						</div>

						{err && <div className={styles.errorText}>{err}</div>}
						{recoveryError && <div className={styles.errorText}>{recoveryError}</div>}
						{verificationError && <div className={styles.errorText}>{verificationError}</div>}
						{recoveryMessage && <div className={styles.successText}>{recoveryMessage}</div>}
						{verificationMessage && <div className={styles.successText}>{verificationMessage}</div>}

						<button
							className={styles.primaryButton}
							onClick={handleSubmit}
							disabled={loading}
						>
							{loading ? "Ingresando…" : "Iniciar sesión"}
						</button>

						<div className={styles.helperText}>
							Si solicitaste recuperar tu contraseña, vas a recibir un enlace para definir una nueva en la ruta segura del email.
						</div>

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