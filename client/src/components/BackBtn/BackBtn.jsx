import { Icon } from "../Icon/Icon";

export function BackBtn({ onClick }) {
  return (
    <button className="btn btn-ghost btn-sm" onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
      <Icon name="chevLeft" size={14} />
      Volver al dashboard
    </button>
  );
}
