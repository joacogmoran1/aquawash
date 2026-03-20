import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "../LoginPage/LoginPage.module.css";

export function ResetPasswordPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { resetPassword } = useAuth();
    const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit() {
        if (!token) {
            setError("El enlace no es válido o está incompleto.");
            return;
        }

        if (!password || !confirm) {
            setError("Completá ambos campos.");
            return;
        }

        if (password.length < 8) {
            setError("La contraseña debe tener al menos 8 caracteres.");
            return;
        }

        if (password !== confirm) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const data = await resetPassword(token, password);
            setSuccess(data.message || "Contraseña actualizada correctamente.");
            setPassword("");
            setConfirm("");
        } catch (e) {
            setError(e.message || "No se pudo actualizar la contraseña.");
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
                    <div className={styles.authBrandTagline}>Recuperación de contraseña</div>
                </div>
                <div className={styles.authFeatures}>
                    <div className={styles.authFeature}>
                        <div className={styles.authFeatureIcon}>🔐</div>
                        <div className={styles.authFeatureText}>Elegí una nueva contraseña segura para volver a ingresar.</div>
                    </div>
                </div>
                <div className={styles.authBigText}>RESET</div>
            </div>

            <div className={styles.authRight}>
                <div className={styles.authFormBox}>
                    <div className={styles.authTitle}>Nueva contraseña</div>
                    <div className={styles.authSubtitle}>Usá el enlace que recibiste por email para completar el cambio.</div>

                    <div className={styles.authForm}>
                        <div className={styles.inputGroup}>
                            <div className={styles.inputLabel}>Nueva contraseña</div>
                            <input
                                className={styles.input}
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (error) setError("");
                                }}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <div className={styles.inputLabel}>Confirmar contraseña</div>
                            <input
                                className={styles.input}
                                type="password"
                                value={confirm}
                                onChange={(e) => {
                                    setConfirm(e.target.value);
                                    if (error) setError("");
                                }}
                                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                            />
                        </div>

                        {error && <div className={styles.errorText}>{error}</div>}
                        {success && <div className={styles.successText}>{success}</div>}

                        <button className={styles.primaryButton} onClick={handleSubmit} disabled={loading}>
                            {loading ? "Actualizando…" : "Guardar nueva contraseña"}
                        </button>

                        <button className={styles.secondaryButton} onClick={() => navigate("/login", { replace: true })}>
                            Volver al login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}