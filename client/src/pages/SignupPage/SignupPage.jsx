import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./SignupPage.module.css";

export function SignupPage() {
	const navigate = useNavigate();
	const { signup } = useAuth();

	const [form, setForm] = useState({
		nombre: "",
		direccion: "",
		telefono: "",
		email: "",
		password: "",
		confirm: "",
	});

	const [err, setErr] = useState("");
	const [loading, setLoading] = useState(false);

	function set(key) {
		return (e) => {
			const value = e.target.value;
			setForm((f) => ({ ...f, [key]: value }));
			if (err) setErr("");
		};
	}

	function validateForm() {
		const nombre = form.nombre.trim();
		const direccion = form.direccion.trim();
		const telefono = form.telefono.trim();
		const email = form.email.trim().toLowerCase();
		const password = form.password;
		const confirm = form.confirm;

		if (!nombre || !direccion || !telefono || !email || !password || !confirm) {
			return "Completá todos los campos.";
		}

		if (nombre.length < 2) {
			return "El nombre del lavadero es demasiado corto.";
		}

		if (direccion.length < 5) {
			return "Ingresá una dirección válida.";
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return "Ingresá un email válido.";
		}

		const telefonoLimpio = telefono.replace(/[^\d]/g, "");
		if (telefonoLimpio.length < 8) {
			return "Ingresá un teléfono válido.";
		}

		if (password.length < 8) {
			return "La contraseña debe tener al menos 8 caracteres.";
		}

		if (password !== confirm) {
			return "Las contraseñas no coinciden.";
		}

		return "";
	}

	function isBackendDownError(error) {
		const msg = String(error?.message || "").toLowerCase();

		return (
			msg.includes("failed to fetch") ||
			msg.includes("network error") ||
			msg.includes("networkerror") ||
			msg.includes("fetch failed") ||
			msg.includes("load failed") ||
			msg.includes("timeout") ||
			msg.includes("server error") ||
			msg.includes("internal server error") ||
			msg.includes("503") ||
			msg.includes("502") ||
			msg.includes("500")
		);
	}

	async function handleSubmit() {
		const validationError = validateForm();
		if (validationError) { setErr(validationError); return; }

		setErr("");
		setLoading(true);

		try {
			await signup({
				...form,
				nombre: form.nombre.trim(),
				direccion: form.direccion.trim(),
				telefono: form.telefono.trim(),
				email: form.email.trim().toLowerCase(),
			});
			navigate("/login", { state: { registered: true } });
		} catch (e) {
			if (isBackendDownError(e)) {
				setErr("No se pudo conectar con el servidor. Intentá de nuevo en unos minutos.");
			} else {
				setErr(e.message || "No se pudo completar el registro.");
			}
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
					<div className={styles.authBrandTagline}>Registrá tu lavadero</div>
				</div>

				<div className={styles.signupInfoBlock}>
					<div className={styles.signupInfoTitle}>EN MINUTOS TENDRÁS:</div>

					{[
						"Tu panel de control listo",
						"Gestión de clientes y autos",
						"Agenda digital de turnos",
						"Reportes de ingresos",
					].map((text) => (
						<div key={text} className={styles.signupInfoItem}>
							<div className={styles.signupInfoArrow}>→</div>
							<div className={styles.signupInfoText}>{text}</div>
						</div>
					))}
				</div>

				<div className={styles.authBigText}>START</div>
			</div>

			<div className={styles.authRight}>
				<div className={`${styles.authFormBox} ${styles.authFormBoxWide}`}>
					<div className={styles.authTitle}>Crear cuenta</div>
					<div className={styles.authSubtitle}>
						Registrá tu lavadero en el sistema
					</div>

					<div className={styles.authForm}>
						<div className={styles.formGrid}>
							<div className={styles.inputGroup}>
								<div className={styles.inputLabel}>Nombre del lavadero</div>
								<input
									className={styles.input}
									placeholder="Ej: Wash & Go"
									value={form.nombre}
									onChange={set("nombre")}
								/>
							</div>

							<div className={styles.inputGroup}>
								<div className={styles.inputLabel}>Teléfono</div>
								<input
									className={styles.input}
									placeholder="11-1234-5678"
									value={form.telefono}
									onChange={set("telefono")}
								/>
							</div>
						</div>

						<div className={styles.inputGroup}>
							<div className={styles.inputLabel}>Dirección</div>
							<input
								className={styles.input}
								placeholder="Av. Corrientes 1234, CABA"
								value={form.direccion}
								onChange={set("direccion")}
							/>
						</div>

						<div className={styles.inputGroup}>
							<div className={styles.inputLabel}>Email</div>
							<input
								className={styles.input}
								type="email"
								placeholder="lavadero@email.com"
								value={form.email}
								onChange={set("email")}
							/>
						</div>

						<div className={styles.formGrid}>
							<div className={styles.inputGroup}>
								<div className={styles.inputLabel}>Contraseña</div>
								<input
									className={styles.input}
									type="password"
									placeholder="••••••••"
									value={form.password}
									onChange={set("password")}
								/>
							</div>

							<div className={styles.inputGroup}>
								<div className={styles.inputLabel}>Confirmar</div>
								<input
									className={styles.input}
									type="password"
									placeholder="••••••••"
									value={form.confirm}
									onChange={set("confirm")}
								/>
							</div>
						</div>

						{err && <div className={styles.errorText}>{err}</div>}

						<button
							className={styles.primaryButton}
							onClick={handleSubmit}
							disabled={loading}
						>
							{loading ? "Creando cuenta…" : "Crear cuenta"}
						</button>
					</div>

					<div className={styles.authSwitch}>
						¿Ya tenés cuenta?{" "}
						<span
							className={styles.authLink}
							onClick={() => navigate("/login")}
						>
							Iniciá sesión
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}