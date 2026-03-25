
// Utils
import { BADGE_COLORS } from "../../utils/constants";

export function StatusBadge({ estado }) {
    const color = BADGE_COLORS[estado] || 'muted';
    return (
        <span className={`badge badge-${color}`}>
            {estado?.toUpperCase()}
        </span>
    );
}