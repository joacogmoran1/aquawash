import { useEffect, useState } from "react";

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
    const [draftSearch, setDraftSearch] = useState(search || "");

    useEffect(() => {
        setDraftSearch(search || "");
    }, [search]);

    function handleSubmit(e) {
        e.preventDefault();
        setSearch(draftSearch.trim());
    }

    function handleClear() {
        setDraftSearch("");
        setSearch("");
    }

    function handleKeyDown(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            setSearch(draftSearch.trim());
        }
    }

    return (
        <div className={styles.sectionHeader}>
            <div className={styles.headerLeft}>
                <div className={styles.sectionTitle}>Clientes</div>
                <span className={`${shared.badge} ${shared.badgeCyan}`}>
                    {processedClients.length} REGISTROS
                </span>
            </div>

            <div className={styles.headerRight}>
                <form className={styles.searchBar} onSubmit={handleSubmit}>
                    <Icon name="search" size={14} color="var(--muted)" />

                    <input
                        type="text"
                        className={styles.searchBarInput}
                        placeholder="Buscar cliente..."
                        value={draftSearch}
                        onChange={(e) => setDraftSearch(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />

                    {draftSearch && (
                        <button
                            type="button"
                            className={styles.searchActionBtn}
                            onClick={handleClear}
                            aria-label="Limpiar búsqueda"
                            title="Limpiar"
                        >
                            <Icon name="x" size={14} />
                        </button>
                    )}

                    <button
                        type="submit"
                        className={`${styles.searchActionBtn} ${styles.searchActionBtnPrimary}`}
                        aria-label="Buscar"
                        title="Buscar"
                    >
                        <Icon name="search" size={14} />
                    </button>
                </form>

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