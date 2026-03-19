
// Style
import shared from "../../../styles/dashboard/Shared.module.css";


export function StatCard({
    label,
    value,
    sub,
    up = true,
    icon,
    color = "var(--cyan)",
    valueClassName = "",
    style,
    onClick,
}) {
    return (
        <div
            className={shared.statCard}
            style={{ "--accent-color": color, ...style }}
            onClick={onClick}
        >
            {icon && <div className={shared.statIcon}>{icon}</div>}
            <div className={shared.statLabel}>{label}</div>
            <div className={`${shared.statValue} ${valueClassName}`}>{value}</div>
            {sub && (
                <div className={`${shared.statChange} ${up ? shared.statUp : shared.statDown}`}>
                    {up ? "↑" : "↓"} {sub}
                </div>
            )}
        </div>
    );
}