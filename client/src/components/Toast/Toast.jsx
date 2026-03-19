import { useEffect } from "react";
import { Icon } from "../Icon/Icon";

export function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return (
    <div className={`toast toast-${type}`}>
      {type === "success" ? <Icon name="check" size={15} color="var(--green)" /> : <Icon name="x" size={15} color="var(--red)" />}
      {msg}
    </div>
  );
}
