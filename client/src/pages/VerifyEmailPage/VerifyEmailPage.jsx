import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "../../styles/LoginPage.module.css";

export function VerifyEmailPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { verifyEmail } = useAuth();
    const token = searchParams.get("token") || "";

    const [status, setStatus] = useState(token ? "loading" : "error");
    const [message, setMessage] = useState(
        token ? "Verificando tu email…" : "El enlace no es válido o está incompleto."
    );

    // Evita que StrictMode (o cualquier re-render) llame a la API dos veces
    const calledRef = useRef(false);

    useEffect(() => {
        if (!token || calledRef.current) return;
        calledRef.current = true;

        verifyEmail(token)
            .then((data) => {
                setStatus("success");
                setMessage(data.message || "Email verificado correctamente.");
            })
            .catch((error) => {
                setStatus("error");
                setMessage(error.message || "No se pudo verificar el email.");
            });
    }, [token, verifyEmail]);

    return (
        <div className={styles.authPage}>
            <div className={styles.authLeft}>
                <div className={styles.authBgPattern} />
                <div className={styles.authBrand}>
                    <div className={styles.authBrandName}>AQUAWASH</div>
                    <div className={styles.authBrandTagline}>Verificación de email</div>
                </div>
                <div className={styles.authFeatures}>
                    <div className={styles.authFeature}>
                        <div className={styles.authFeatureIcon}>✉️</div>
                        <div className={styles.authFeatureText}>
                            Confirmá tu email para asegurar el acceso a tu lavadero.
                        </div>
                    </div>
                </div>
                <div className={styles.authBigText}>MAIL</div>
            </div>

            <div className={styles.authRight}>
                <div className={styles.authFormBox}>
                    <div className={styles.authTitle}>
                        {status === "loading"
                            ? "Verificando"
                            : status === "success"
                                ? "Email verificado"
                                : "No se pudo verificar"}
                    </div>
                    <div className={styles.authSubtitle}>{message}</div>

                    <div className={styles.authForm}>
                        <button
                            className={styles.primaryButton}
                            onClick={() => navigate("/login", { replace: true })}
                        >
                            Ir a iniciar sesión
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}