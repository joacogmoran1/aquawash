import { useEffect, useState } from "react";

// Api
import api from "../../../api/api";

// Components
import { BackBtn } from "../../../components/BackBtn/BackBtn";
import { SectionCard } from "../../../components/dashboard/SectionCard/SectionCard";
import { StatCard } from "../../../components/dashboard/StatCard/StatCard";
import { EmptyState } from "../../../components/dashboard/EmptyState/EmptyState";
import { PageLoading } from "../../../components/PageLoading/PageLoading";

// Utils
import { PAYMENT_METHOD_COLORS, MINI_COLORS } from "../../../utils/constants";

// Style
import shared from "../../../styles/dashboard/Shared.module.css";
import styles from "../../../styles/dashboard/Ingresos.module.css";


export function IngresosDetail({ onBack }) {
    const [selDay, setSelDay] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/dashboard/semana")
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className={styles.pageContent}>
                <BackBtn onClick={onBack} />
                <PageLoading />
            </div>
        );
    }

    if (!data) {
        return (
            <div className={styles.pageContent}>
                <BackBtn onClick={onBack} />
            </div>
        );
    }

    const { semanaActual, semanaAnterior, resumen, porServicio, metodosPago } = data;
    const maxVal = Math.max(...semanaActual.map((d) => d.ingresos), ...semanaAnterior, 1);

    return (
        <div className={styles.pageContent}>
            <BackBtn onClick={onBack} />

            <div className={styles.statsGrid}>
                <StatCard
                    label="Total semanal"
                    value={`$${resumen.totalActual.toLocaleString("es-AR")}`}
                    sub={`${resumen.diffPct >= 0 ? "+" : ""}${resumen.diffPct}% vs semana anterior`}
                    up={resumen.diffPct >= 0}
                    color="var(--cyan)"
                    valueClassName={shared.statValueMd}
                />
                <StatCard
                    label="Mejor día"
                    value={`${resumen.mejorDia.day} $${(resumen.mejorDia.ingresos / 1000).toFixed(1)}k`}
                    sub={`${resumen.mejorDia.lavados} autos`}
                    color="var(--green)"
                    valueClassName={shared.statValueMd}
                />
                <StatCard
                    label="Ticket promedio"
                    value={`$${resumen.ticketPromSem.toLocaleString("es-AR")}`}
                    sub="Promedio semanal"
                    color="var(--orange)"
                    valueClassName={shared.statValueMd}
                />
                <StatCard
                    label="Servicios totales"
                    value={String(resumen.totalLavados)}
                    sub="Semana completa"
                    color="var(--cyan)"
                    valueClassName={shared.statValueMd}
                />
            </div>

            <div className={styles.ingresosLayout}>
                <SectionCard>
                    <div className={shared.sectionHeader}>
                        <div>
                            <div className={shared.sectionTitle}>Ingresos diarios</div>
                            <div className={shared.sectionMeta}>SEMANA ACTUAL VS ANTERIOR</div>
                        </div>

                        <div className={styles.legendRow}>
                            <div className={styles.legendItem}>
                                <div className={`${styles.legendDot} ${styles.legendDotCyan}`} />
                                <span className={styles.legendText}>Esta semana</span>
                            </div>
                            <div className={styles.legendItem}>
                                <div className={`${styles.legendDot} ${styles.legendDotBorder}`} />
                                <span className={styles.legendText}>Sem. anterior</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.groupedBarChart}>
                        {semanaActual.map((d, i) => (
                            <div
                                key={d.day}
                                className={styles.groupedBarCol}
                                onClick={() => setSelDay(selDay === i ? null : i)}
                            >
                                <div className={styles.groupedBarInner}>
                                    <div
                                        className={styles.groupedBarPrev}
                                        style={{
                                            height: `${(semanaAnterior[i] / maxVal) * 120}px`,
                                            background: selDay === i ? "var(--muted2)" : "var(--border2)",
                                        }}
                                    />
                                    <div
                                        className={styles.groupedBarCurrent}
                                        style={{
                                            height: `${(d.ingresos / maxVal) * 120}px`,
                                            background: selDay === i ? "rgba(96, 170, 255, 0.95)" : "var(--cyan)",
                                            boxShadow:
                                                selDay === i
                                                    ? "0 0 16px rgba(47,128,255,0.5)"
                                                    : "0 0 6px rgba(47,128,255,0.15)",
                                        }}
                                    />
                                </div>
                                <div
                                    className={styles.groupedBarLabel}
                                    style={{ color: selDay === i ? "var(--cyan)" : "var(--muted)" }}
                                >
                                    {d.day}
                                </div>
                            </div>
                        ))}
                    </div>

                    {selDay !== null && (() => {
                        const d = semanaActual[selDay];
                        const prev = semanaAnterior[selDay];
                        const diff = d.ingresos - prev;

                        return (
                            <div className={styles.dayDetailCard}>
                                <div className={styles.dayDetailHeader}>
                                    <div>
                                        <div className={styles.dayDetailTitle}>
                                            {d.day} — {d.fecha}
                                        </div>
                                        <div className={shared.sectionMeta}>DETALLE DEL DÍA</div>
                                    </div>
                                    <button className={styles.closeBtn} onClick={() => setSelDay(null)}>
                                        ×
                                    </button>
                                </div>

                                <div className={styles.dayMetricsGrid}>
                                    {[
                                        { l: "Ingresos", v: `$${d.ingresos.toLocaleString("es-AR")}`, c: "var(--cyan)" },
                                        {
                                            l: "vs sem. ant",
                                            v: `${diff >= 0 ? "+" : ""}$${diff.toLocaleString("es-AR")}`,
                                            c: diff >= 0 ? "var(--green)" : "var(--red)",
                                        },
                                        { l: "Autos", v: d.lavados, c: "var(--text)" },
                                        {
                                            l: "Ticket prom",
                                            v: `$${d.ticketProm.toLocaleString("es-AR")}`,
                                            c: "var(--orange)",
                                        },
                                    ].map((r) => (
                                        <div key={r.l} className={styles.metricBox}>
                                            <div className={styles.metricLabel}>{r.l.toUpperCase()}</div>
                                            <div className={styles.metricValue} style={{ color: r.c }}>
                                                {r.v}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {d.porServicio?.length > 0 && (
                                    <div className={styles.serviceMiniGrid}>
                                        {d.porServicio.map((s, idx) => (
                                            <div key={s.nombre} className={styles.serviceMiniCard}>
                                                <div
                                                    className={styles.serviceMiniValue}
                                                    style={{ color: MINI_COLORS[idx % MINI_COLORS.length] }}
                                                >
                                                    {s.cantidad}
                                                </div>
                                                <div className={styles.serviceMiniLabel}>{s.nombre}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </SectionCard>

                <div className={styles.sideColumn}>
                    <SectionCard>
                        <div className={`${shared.sectionTitle} ${styles.sideSectionTitle}`}>
                            Por servicio (semana)
                        </div>

                        {porServicio.length === 0 ? (
                            <EmptyState icon="—" text="Sin datos" />
                        ) : (
                            porServicio.map((s, idx) => {
                                const color = MINI_COLORS[idx % MINI_COLORS.length];
                                return (
                                    <div key={s.nombre} className={styles.serviceBlock}>
                                        <div className={styles.serviceRow}>
                                            <span className={styles.serviceName}>{s.nombre}</span>
                                            <span className={styles.serviceCount} style={{ color }}>
                                                {s.cantidad} lavados
                                            </span>
                                        </div>
                                        <div className={styles.progressTrack}>
                                            <div
                                                className={styles.progressFill}
                                                style={{ width: `${s.pct}%`, background: color }}
                                            />
                                        </div>
                                        <div className={styles.serviceIncome}>
                                            ${s.ingresos.toLocaleString("es-AR")} en ingresos
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </SectionCard>

                    <SectionCard>
                        <div className={`${shared.sectionTitle} ${styles.sideSectionTitle}`}>
                            Métodos de pago
                        </div>

                        {metodosPago.length === 0 ? (
                            <EmptyState icon="—" text="Sin pagos cobrados aún" />
                        ) : (
                            metodosPago.map((p) => (
                                <div key={p.metodo} className={styles.paymentRow}>
                                    <div
                                        className={styles.paymentDot}
                                        style={{ background: PAYMENT_METHOD_COLORS[p.metodo] || "var(--muted2)" }}
                                    />
                                    <span className={styles.paymentName} style={{ textTransform: "capitalize" }}>
                                        {p.metodo}
                                    </span>
                                    <div className={styles.paymentTrack}>
                                        <div
                                            className={styles.paymentFill}
                                            style={{
                                                width: `${p.pct}%`,
                                                background: PAYMENT_METHOD_COLORS[p.metodo] || "var(--muted2)",
                                            }}
                                        />
                                    </div>
                                    <span className={styles.paymentValue}>{p.cantidad}</span>
                                </div>
                            ))
                        )}
                    </SectionCard>
                </div>
            </div>

            <SectionCard>
                <div className={`${shared.sectionTitle} ${styles.sideSectionTitle}`}>Detalle por día</div>

                <table className={shared.table}>
                    <thead>
                        <tr>
                            <th>Día</th>
                            <th>Fecha</th>
                            <th>Ingresos</th>
                            <th>Autos lavados</th>
                            <th>Ticket promedio</th>
                            <th>vs sem. ant.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {semanaActual.map((d, i) => {
                            const diff = d.ingresos - semanaAnterior[i];
                            return (
                                <tr
                                    key={d.day}
                                    className={shared.clickableRow}
                                    onClick={() => setSelDay(selDay === i ? null : i)}
                                >
                                    <td
                                        className={shared.dayCell}
                                        style={{ color: selDay === i ? "var(--cyan)" : "var(--text)" }}
                                    >
                                        {d.day}
                                    </td>
                                    <td className={shared.dateCell}>{d.fecha}</td>
                                    <td className={shared.moneyCell}>${d.ingresos.toLocaleString("es-AR")}</td>
                                    <td className={shared.numberCell}>{d.lavados}</td>
                                    <td className={shared.orangeMonoCell}>
                                        ${d.ticketProm.toLocaleString("es-AR")}
                                    </td>
                                    <td>
                                        <span
                                            className={shared.diffCell}
                                            style={{ color: diff >= 0 ? "var(--green)" : "var(--red)" }}
                                        >
                                            {diff >= 0 ? "+" : ""}${diff.toLocaleString("es-AR")}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </SectionCard>
        </div>
    );
}