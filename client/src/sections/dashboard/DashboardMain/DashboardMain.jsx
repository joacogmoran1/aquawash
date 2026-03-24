import { useEffect, useState } from "react";

// Api
import api from "../../../api/api";

// Components
import { Icon } from "../../../components/Icon/Icon";
import { SectionCard } from "../../../components/dashboard/SectionCard/SectionCard";
import { StatCard } from "../../../components/dashboard/StatCard/StatCard";
import { EmptyState } from "../../../components/dashboard/EmptyState/EmptyState";
import { EstadoBadge } from "../../../components/dashboard/EstadoBadage/EstadoBadage";
import { PageLoading } from "../../../components/PageLoading/PageLoading";

// Utils
import {
    fmtCurrency,
    fmtHour,
    getWeeklyTotal,
    getMaxIncome,
} from "../../../utils/dashboard/helpers";

// Style
import shared from "../../../styles/dashboard/Shared.module.css";
import styles from "../../../styles/dashboard/Main.module.css";

export function DashboardMain({ onGoIngresos, onGoOrdenes }) {
    const [stats, setStats] = useState(null);
    const [semana, setSemana] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const [dashData, ordenesData, semanaData] = await Promise.all([
                    api.get("/dashboard"),
                    api.get("/ordenes"),
                    api.get("/dashboard/semana"),
                ]);

                if (cancelled) return;

                setStats(dashData);
                setOrders(ordenesData.filter((o) => o.estado !== "entregado"));
                setSemana(semanaData);
            } catch (e) {
                if (!cancelled) console.error("Dashboard error:", e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();

        const interval = setInterval(() => {
            if (!cancelled) load();
        }, 30_000);

        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, []);

    if (loading) {
        return <PageLoading />;
    }

    const semanaActual = semana?.semanaActual || [];
    const maxIngresos = getMaxIncome(semanaActual);
    const totalSemana = getWeeklyTotal(semanaActual);

    return (
        <div className={styles.pageContent}>
            <div className={styles.statsGrid}>
                <StatCard
                    label="Ingresos hoy"
                    value={fmtCurrency(stats?.ingresos_hoy)}
                    sub="Autos entregados"
                    icon="💵"
                    color="var(--cyan)"
                />
                <StatCard
                    label="Autos lavados"
                    value={String(stats?.autos_lavados_hoy || 0)}
                    sub="Entregados hoy"
                    icon="🚗"
                    color="var(--green)"
                />
                <StatCard
                    label="Ticket promedio"
                    value={fmtCurrency(stats?.ticket_promedio)}
                    sub="Promedio del día"
                    icon="📊"
                    color="var(--orange)"
                />
                <StatCard
                    label="Clientes nuevos"
                    value={String(stats?.clientes_nuevos_hoy || 0)}
                    sub="Registrados hoy"
                    icon="👥"
                    color="var(--cyan)"
                />
            </div>

            <div className={styles.dashboardGrid}>
                <div className={styles.leftColumn}>
                    <SectionCard>
                        <div className={shared.sectionHeader}>
                            <div className={shared.sectionTitle}>Órdenes activas</div>

                            <div className={shared.sectionHeaderRight}>
                                <div className={styles.liveStatus}>
                                    <div className={styles.statusDot} />
                                    <span className={styles.statusText}>En tiempo real</span>
                                </div>

                                <button className={shared.btnGhostSm} onClick={onGoOrdenes}>
                                    Ver todas <Icon name="chevRight" size={13} />
                                </button>
                            </div>
                        </div>

                        {orders.length === 0 ? (
                            <EmptyState icon="✅" text="Sin órdenes activas" />
                        ) : (
                            <div className={styles.ordersContainer}>
                                <table className={shared.table}>
                                    <thead>
                                        <tr>
                                            <th>Cliente / Auto</th>
                                            <th>Servicio</th>
                                            <th>Hora</th>
                                            <th>Estado</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {orders.map((o) => (
                                            <tr key={o.id}>
                                                <td>
                                                    <div className={shared.clientPrimary}>
                                                        {o.Cliente?.nombre || "—"}
                                                    </div>
                                                    <div className={shared.clientSecondary}>
                                                        {o.Auto?.marca} {o.Auto?.modelo} ·{" "}
                                                        {o.Auto?.patente}
                                                    </div>
                                                </td>

                                                <td className={shared.serviceCell}>
                                                    {o.servicio_tipo}
                                                </td>

                                                <td className={shared.timeCell}>
                                                    {fmtHour(o.hora_llegada)}
                                                </td>

                                                <td>
                                                    <EstadoBadge estado={o.estado} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </SectionCard>

                    <SectionCard>
                        <div className={shared.sectionHeader}>
                            <div>
                                <div className={shared.sectionTitle}>Ingresos semanales</div>
                                <div className={shared.sectionMeta}>ÚLTIMOS 7 DÍAS</div>
                            </div>

                            <div className={shared.sectionHeaderRight}>
                                <div className={shared.totalText}>
                                    Total:{" "}
                                    <span className={shared.totalValue}>
                                        ${totalSemana.toLocaleString("es-AR")}
                                    </span>
                                </div>

                                <button className={shared.btnGhostSm} onClick={onGoIngresos}>
                                    Ver detalle <Icon name="chevRight" size={13} />
                                </button>
                            </div>
                        </div>

                        {semanaActual.length === 0 ? (
                            <EmptyState icon="📊" text="Sin datos esta semana" />
                        ) : (
                            <div className={styles.barChart}>
                                {semanaActual.map((d) => (
                                    <div className={styles.barCol} key={d.day}>
                                        <div className={styles.barValue}>
                                            ${d.ingresos >= 1000
                                                ? `${(d.ingresos / 1000).toFixed(1)}k`
                                                : d.ingresos.toLocaleString("es-AR")}
                                        </div>

                                        <div
                                            className={styles.bar}
                                            style={{
                                                height: `${(d.ingresos / maxIngresos) * 90}px`,
                                            }}
                                        />

                                        <div className={styles.barLabel}>{d.day}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </SectionCard>
                </div>

                <div className={styles.rightColumn}>
                    <SectionCard>
                        <div className={`${shared.sectionTitle} ${styles.sideSectionTitle}`}>
                            Órdenes por estado
                        </div>

                        {[
                            { nombre: "Agendados", key: "agendado", color: "var(--cyan)" },
                            { nombre: "En espera", key: "esperando", color: "var(--orange)" },
                            { nombre: "Lavando", key: "lavando", color: "var(--cyan)" },
                            { nombre: "Listos", key: "listo", color: "var(--green)" },
                        ].map((s) => {
                            const n = stats?.ordenes_activas?.[s.key] || 0;
                            const tot =
                                Object.values(stats?.ordenes_activas || {}).reduce(
                                    (a, b) => a + b,
                                    0
                                ) || 1;

                            return (
                                <div key={s.nombre} className={styles.serviceItem}>
                                    <div className={styles.serviceRow}>
                                        <span className={styles.serviceName}>{s.nombre}</span>
                                        <span
                                            className={styles.serviceCount}
                                            style={{ color: s.color }}
                                        >
                                            {n}
                                        </span>
                                    </div>

                                    <div className={styles.progressTrack}>
                                        <div
                                            className={styles.progressFill}
                                            style={{
                                                width: `${Math.round((n / tot) * 100)}%`,
                                                background: s.color,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </SectionCard>

                    <SectionCard>
                        <div className={`${shared.sectionTitle} ${styles.sideSectionTitle}`}>
                            Métricas
                        </div>

                        {[
                            {
                                label: "Tiempo prom. lavado",
                                value: `${Math.round(stats?.tiempo_promedio_lavado || 0)} min`,
                                color: "var(--cyan)",
                            },
                            {
                                label: "Órdenes entregadas",
                                value: String(stats?.autos_lavados_hoy || 0),
                                color: "var(--green)",
                            },
                            {
                                label: "Ticket promedio",
                                value: fmtCurrency(stats?.ticket_promedio),
                                color: "var(--orange)",
                            },
                        ].map((r) => (
                            <div key={r.label} className={styles.summaryRow}>
                                <span className={styles.summaryLabel}>{r.label}</span>
                                <span
                                    className={styles.summaryValue}
                                    style={{ color: r.color }}
                                >
                                    {r.value}
                                </span>
                            </div>
                        ))}
                    </SectionCard>
                </div>
            </div>
        </div>
    );
}