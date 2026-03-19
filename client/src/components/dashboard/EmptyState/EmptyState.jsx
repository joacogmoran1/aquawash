
// Style
import shared from "../../../styles/dashboard/Shared.module.css";


export function EmptyState({ icon, text }) {
    return (
        <div className={shared.emptyState}>
            <div className={shared.emptyIcon}>{icon}</div>
            <div className={shared.emptyText}>{text}</div>
        </div>
    );
}