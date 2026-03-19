
// Components
import { OperationScheduleCard } from "../../../components/config/OperationScheduleCard/OperationScheduleCard";

// Style
import layoutStyles from "../../../styles/config/ConfigPageLayout.module.css";

export function OperationScheduleSection({
    operacion,
    setOperacion,
    handleHorarioChange,
    disabled,
}) {
    return (
        <div className={`${layoutStyles.gridColumn} ${layoutStyles.fullWidth}`}>
            <OperationScheduleCard
                operacion={operacion}
                setOperacion={setOperacion}
                handleHorarioChange={handleHorarioChange}
                disabled={disabled}
            />
        </div>
    );
}