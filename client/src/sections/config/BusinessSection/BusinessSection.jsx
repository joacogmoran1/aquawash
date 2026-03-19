
// Components
import { BusinessFormCard } from "../../../components/config/BusinessFormCard/BusinessFormCard";

// Style
import layoutStyles from "../../../styles/config/ConfigPageLayout.module.css";

export function BusinessSection({
    negocioForm,
    setNegocioForm,
    disabled,
}) {
    return (
        <div className={layoutStyles.gridColumn}>
            <BusinessFormCard
                negocioForm={negocioForm}
                setNegocioForm={setNegocioForm}
                disabled={disabled}
            />
        </div>
    );
}