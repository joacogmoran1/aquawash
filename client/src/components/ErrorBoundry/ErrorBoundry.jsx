import { Component } from "react";

/**
 * ErrorBoundary — captura errores de JS en el árbol de componentes hijo
 * y muestra una UI de fallback en lugar de una pantalla en blanco.
 *
 * Uso:
 *   <ErrorBoundary>
 *     <MiComponente />
 *   </ErrorBoundary>
 *
 *   <ErrorBoundary fallback={<div>Falló esta sección</div>}>
 *     <MiComponente />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        // En producción enviar a un servicio de errores (Sentry, etc.)
        console.error("[ErrorBoundary]", error, info.componentStack);
    }

    handleReset() {
        this.setState({ hasError: false, error: null });
    }

    render() {
        if (!this.state.hasError) {
            return this.props.children;
        }

        // Si se pasó un fallback personalizado, usarlo
        if (this.props.fallback) {
            return this.props.fallback;
        }

        const isProd = import.meta.env.PROD;

        return (
            <div
                style={{
                    padding: "40px 24px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "300px",
                    textAlign: "center",
                    color: "var(--text)",
                }}
            >
                <div style={{ fontSize: 32, marginBottom: 16 }}>⚠️</div>

                <div
                    style={{
                        fontSize: 16,
                        fontWeight: 600,
                        marginBottom: 8,
                    }}
                >
                    Algo salió mal
                </div>

                <div
                    style={{
                        fontSize: 13,
                        color: "var(--muted2)",
                        marginBottom: 24,
                        maxWidth: 380,
                    }}
                >
                    {isProd
                        ? "Ocurrió un error inesperado. Por favor recargá la página."
                        : this.state.error?.message || "Error desconocido"}
                </div>

                {!isProd && this.state.error?.stack && (
                    <pre
                        style={{
                            fontSize: 11,
                            color: "var(--muted)",
                            background: "var(--card2)",
                            border: "1px solid var(--border)",
                            borderRadius: 8,
                            padding: "12px 16px",
                            maxWidth: 600,
                            overflowX: "auto",
                            textAlign: "left",
                            marginBottom: 24,
                        }}
                    >
                        {this.state.error.stack}
                    </pre>
                )}

                <button
                    onClick={() => this.handleReset()}
                    style={{
                        padding: "8px 20px",
                        borderRadius: 8,
                        border: "1px solid var(--border2)",
                        background: "transparent",
                        color: "var(--text)",
                        cursor: "pointer",
                        fontSize: 13,
                        fontFamily: "inherit",
                    }}
                >
                    Intentar de nuevo
                </button>
            </div>
        );
    }
}