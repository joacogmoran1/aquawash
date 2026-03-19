
// Style
import shared from "../../../styles/dashboard/Shared.module.css";


export function EstadoBadge({ estado }) {
    const badgeMap = {
        agendado: shared.badgeCyan,
        esperando: shared.badgeOrange,
        lavando: shared.badgeCyan,
        listo: shared.badgeGreen,
        entregado: shared.badgeMuted,
        cancelado: shared.badgeRed,
    };

    return (
        <span className={`${shared.badge} ${badgeMap[estado] || shared.badgeMuted}`}>
            {estado?.toUpperCase()}
        </span>
    );
}