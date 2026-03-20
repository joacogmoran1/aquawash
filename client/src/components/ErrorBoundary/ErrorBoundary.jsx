import { Component } from "react";

export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error("[ErrorBoundary]", error, info.componentStack);
    }

    handleReset() {
        this.setState({ hasError: false, error: null });
    }

    render() {
        if (!this.state.hasError) return this.props.children;
        if (this.props.fallback) return this.props.fallback;

        return (
            <div style={{
                padding: "40px 24px",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                minHeight: "300px", textAlign: "center",
                color: "var(--text)",
            }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>⚠️</div>

                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                    Algo salió mal
                </div>

                <div style={{ fontSize: 13, color: "var(--muted2)", marginBottom: 24, maxWidth: 380 }}>
                    Ocurrió un error inesperado. Por favor recargá la página.
                </div>

                <button
                    onClick={() => this.handleReset()}
                    style={{
                        padding: "8px 20px", borderRadius: 8,
                        border: "1px solid var(--border2)", background: "transparent",
                        color: "var(--text)", cursor: "pointer",
                        fontSize: 13, fontFamily: "inherit",
                    }}
                >
                    Intentar de nuevo
                </button>
            </div>
        );
    }
}