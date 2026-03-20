// Components
import { ClientsToolbar } from "../../../components/client/ClientsToolbar/ClientsToolbar";
import { ClientsTable } from "../../../components/client/ClientsTable/ClientsTable";
import { ClientsState } from "../../../components/client/ClientsState/ClientsState";

// Style
import layoutStyles from "../../../styles/clients/ClientsPageLayout.module.css";
import shared from "../../../styles/clients/ClientsShared.module.css";

export function ClientsContentSection({
    search,
    setSearch,
    sortBy,
    setSortBy,
    lastVisitFilter,
    setLastVisitFilter,
    processedClients,
    totalClients,
    onNewClient,
    setSelectedId,
    requestDelete,
    pagination,
    currentPage,
    setCurrentPage,
}) {
    return (
        <div className={layoutStyles.pageContent}>
            <div className={shared.card}>
                <ClientsToolbar
                    search={search}
                    setSearch={setSearch}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    lastVisitFilter={lastVisitFilter}
                    setLastVisitFilter={setLastVisitFilter}
                    processedClients={processedClients}
                    totalClients={totalClients}
                    onNewClient={onNewClient}
                />

                {processedClients.length === 0 ? (
                    <ClientsState type="empty" />
                ) : (
                    <ClientsTable
                        processedClients={processedClients}
                        setSelectedId={setSelectedId}
                        handleDelete={requestDelete}
                    />
                )}

                {pagination.totalPages > 1 && (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 12,
                            padding: "16px 0 4px",
                            borderTop: "1px solid var(--border)",
                            marginTop: 12,
                        }}
                    >
                        <button
                            className={`${shared.btn} ${shared.btnGhost} ${shared.btnSm}`}
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage <= 1}
                        >
                            ← Anterior
                        </button>

                        <span
                            style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: 12,
                                color: "var(--muted2)",
                            }}
                        >
                            {currentPage} / {pagination.totalPages}
                            {" "}·{" "}
                            {pagination.total} clientes
                        </span>

                        <button
                            className={`${shared.btn} ${shared.btnGhost} ${shared.btnSm}`}
                            onClick={() =>
                                setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
                            }
                            disabled={currentPage >= pagination.totalPages}
                        >
                            Siguiente →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
