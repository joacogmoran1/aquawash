// Components
import { Icon } from "../../Icon/Icon";

// Style
import shared from "../../../styles/clients/ClientsShared.module.css";
import styles from "../../../styles/clients/ClientsToolbar.module.css";

export function ClientsToolbar({
    search,
    setSearch,
    sortBy,
    setSortBy,
    lastVisitFilter,
    setLastVisitFilter,
    processedClients,
    onNewClient,
}) {
    return (
        <div className={styles.sectionHeader}>
            <div className={styles.headerLeft}>
                <div className={styles.sectionTitle}>Clientes</div>
                <span className={`${shared.badge} ${shared.badgeCyan}`}>
                    {processedClients.length} REGISTROS
                </span>
            </div>

            <div className={styles.headerRight}>
                <div className={styles.searchBar}>
                    <Icon name="search" size={14} color="var(--muted)" />
                    <input
                        className={styles.searchBarInput}
                        placeholder="Buscar cliente..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <select
                    className={styles.select}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    <option value="default">Ordenar por</option>
                    <option value="visitas_desc">Más visitas</option>
                    <option value="ultima_visita_desc">Última visita reciente</option>
                </select>

                <select
                    className={styles.select}
                    value={lastVisitFilter}
                    onChange={(e) => setLastVisitFilter(e.target.value)}
                >
                    <option value="todas">Todas las visitas</option>
                    <option value="mes">Última visita: hace un mes</option>
                    <option value="anio">Última visita: hace un año</option>
                    <option value="mas_de_un_anio">Última visita: + de un año</option>
                </select>

                <button
                    className={`${shared.btn} ${shared.btnPrimary} ${styles.newClientBtn}`}
                    onClick={onNewClient}
                    type="button"
                >
                    <Icon name="plus" size={14} />
                    Nuevo cliente
                </button>
            </div>
        </div>
    );
}