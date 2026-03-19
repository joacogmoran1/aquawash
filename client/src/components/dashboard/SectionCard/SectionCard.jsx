
// Style
import shared from "../../../styles/dashboard/Shared.module.css";


export function SectionCard({ children, className = "" }) {
    return <div className={`${shared.card} ${className}`}>{children}</div>;
}