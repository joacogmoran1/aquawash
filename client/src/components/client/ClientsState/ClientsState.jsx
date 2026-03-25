
// Components
import { STATE_MAP } from "../../../utils/constants";

// Utils
import { EmptyState } from "../../EmptyState/EmptyState";


export function ClientsState({ type }) {
    const { icon, text } = STATE_MAP[type];
    return <EmptyState icon={icon} text={text} bordered />;
}